package com.kajol.assistant.ui.viewmodel

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kajol.assistant.data.model.AssistantState
import com.kajol.assistant.data.model.ConversationMessage
import com.kajol.assistant.data.preferences.KajolPreferences
import com.kajol.assistant.data.security.SecureStorage
import com.kajol.assistant.domain.SystemActionExecutor
import com.kajol.assistant.domain.VoiceIntentParser
import com.kajol.assistant.service.BengaliSpeechRecognizer
import com.kajol.assistant.service.BengaliTtsManager
import com.kajol.assistant.service.KajolVoiceService
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class ScreenTab {
    HOME,
    COMMANDS,
    PERMISSIONS,
    SETTINGS,
    HISTORY
}

data class PermissionItem(
    val id: String,
    val title: String,
    val bengaliDescription: String,
    val isGranted: Boolean,
    val isSpecialSetting: Boolean = false
)

@HiltViewModel
class MainViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferences: KajolPreferences,
    private val secureStorage: SecureStorage,
    private val speechRecognizer: BengaliSpeechRecognizer,
    private val ttsManager: BengaliTtsManager,
    private val intentParser: VoiceIntentParser,
    private val actionExecutor: SystemActionExecutor
) : ViewModel() {

    val currentTab = MutableStateFlow(ScreenTab.HOME)

    private val _assistantState = MutableStateFlow(AssistantState.IDLE)
    val assistantState: StateFlow<AssistantState> = _assistantState.asStateFlow()

    private val _messages = MutableStateFlow<List<ConversationMessage>>(emptyList())
    val messages: StateFlow<List<ConversationMessage>> = _messages.asStateFlow()

    private val _permissionList = MutableStateFlow<List<PermissionItem>>(emptyList())
    val permissionList: StateFlow<List<PermissionItem>> = _permissionList.asStateFlow()

    val wakePhrase = preferences.wakePhraseFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), "হ্যালো কাজল"
    )

    val voicePitch = preferences.voicePitchFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), 1.1f
    )

    val voiceRate = preferences.voiceRateFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), 0.92f
    )

    val lockScreenEnabled = preferences.lockScreenEnabledFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), true
    )

    val alwaysListening = preferences.alwaysListeningFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), true
    )

    private val _apiKey = MutableStateFlow("")
    val apiKey: StateFlow<String> = _apiKey.asStateFlow()

    init {
        loadApiKey()
        checkPermissions()
        observeSpeechEvents()
    }

    private fun loadApiKey() {
        _apiKey.value = secureStorage.getGeminiApiKey() ?: ""
    }

    fun saveApiKey(key: String) {
        secureStorage.saveGeminiApiKey(key)
        _apiKey.value = key
    }

    fun setWakePhrase(phrase: String) {
        viewModelScope.launch {
            preferences.setWakePhrase(phrase)
        }
    }

    fun setVoicePitch(pitch: Float) {
        viewModelScope.launch {
            preferences.setVoicePitch(pitch)
        }
    }

    fun setVoiceRate(rate: Float) {
        viewModelScope.launch {
            preferences.setVoiceRate(rate)
        }
    }

    fun setLockScreenEnabled(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setLockScreenEnabled(enabled)
        }
    }

    fun setAlwaysListening(enabled: Boolean) {
        viewModelScope.launch {
            preferences.setAlwaysListening(enabled)
            if (enabled) {
                KajolVoiceService.start(context)
            } else {
                KajolVoiceService.stop(context)
            }
        }
    }

    fun checkPermissions() {
        val items = mutableListOf<PermissionItem>()

        // 1. Audio Record
        val audioGranted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
        items.add(
            PermissionItem(
                id = Manifest.permission.RECORD_AUDIO,
                title = "মাইক্রোফোন (Record Audio)",
                bengaliDescription = "আপনার কণ্ঠস্বর শুনে বাংলায় উত্তর দেওয়ার জন্য আবশ্যক।",
                isGranted = audioGranted
            )
        )

        // 2. Notifications
        val notifGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context, Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else true
        items.add(
            PermissionItem(
                id = "POST_NOTIFICATIONS",
                title = "নোটিফিকেশন (Notifications)",
                bengaliDescription = "কাজল ব্যাকগ্রাউন্ডে চালু থাকার স্ট্যাটাস ও সতর্কবার্তা দেখানোর জন্য।",
                isGranted = notifGranted
            )
        )

        // 3. System Alert Window (Floating Orb)
        val overlayGranted = Settings.canDrawOverlays(context)
        items.add(
            PermissionItem(
                id = "SYSTEM_ALERT_WINDOW",
                title = "ভাসমান অর্ব (Display Over Apps)",
                bengaliDescription = "যেকোনো অ্যাপ বা স্ক্রিনে কাজলের গোলক ভাসিয়ে রাখার জন্য।",
                isGranted = overlayGranted,
                isSpecialSetting = true
            )
        )

        // 4. Battery Optimization
        val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        val batteryIgnored = pm?.isIgnoringBatteryOptimizations(context.packageName) ?: false
        items.add(
            PermissionItem(
                id = "IGNORE_BATTERY_OPTIMIZATION",
                title = "ব্যাটারি অপ্টিমাইজেশন বাইপাস",
                bengaliDescription = "মোবাইল লক বা স্লিপ মোডে থাকলেও যেন কাজল সবসময় আপনার ডাক শুনতে পায়।",
                isGranted = batteryIgnored,
                isSpecialSetting = true
            )
        )

        // 5. Phone Call
        val callGranted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED
        items.add(
            PermissionItem(
                id = Manifest.permission.CALL_PHONE,
                title = "ফোন কল (Call Phone)",
                bengaliDescription = "কণ্ঠের নির্দেশে সরাসরি কাউকে ফোন করার জন্য।",
                isGranted = callGranted
            )
        )

        // 6. Contacts
        val contactsGranted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED
        items.add(
            PermissionItem(
                id = Manifest.permission.READ_CONTACTS,
                title = "পরিচিতি তালিকা (Read Contacts)",
                bengaliDescription = "কাউকে নাম ধরে কল বা এসএমএস করার জন্য ফোনবুক পড়ার অনুমতি।",
                isGranted = contactsGranted
            )
        )

        // 7. SMS
        val smsGranted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED
        items.add(
            PermissionItem(
                id = Manifest.permission.SEND_SMS,
                title = "এসএমএস পাঠানো (Send SMS)",
                bengaliDescription = "ভয়েস কমান্ড দিয়ে মেসেজ পাঠানোর অনুমতি।",
                isGranted = smsGranted
            )
        )

        _permissionList.value = items
    }

    private fun observeSpeechEvents() {
        speechRecognizer.onSpeechResultListener = { text ->
            processVoiceInput(text)
        }
    }

    fun startListening() {
        _assistantState.value = AssistantState.LISTENING
        speechRecognizer.startListening(continuous = false)
    }

    fun stopListening() {
        speechRecognizer.stopListening()
        _assistantState.value = AssistantState.IDLE
    }

    fun processVoiceInput(text: String) {
        if (text.isBlank()) return

        val userMsg = ConversationMessage(
            text = text,
            isFromUser = true
        )
        _messages.value = _messages.value + userMsg

        _assistantState.value = AssistantState.THINKING

        viewModelScope.launch {
            val intent = intentParser.parse(text)
            val result = actionExecutor.execute(intent)

            val kajolMsg = ConversationMessage(
                text = result.spokenResponse,
                isFromUser = false,
                intentDescription = intent.javaClass.simpleName,
                executedActionSuccess = result.success
            )
            _messages.value = _messages.value + kajolMsg

            _assistantState.value = AssistantState.SPEAKING
            ttsManager.speak(result.spokenResponse) {
                _assistantState.value = AssistantState.IDLE
            }
        }
    }

    fun testTtsVoice() {
        ttsManager.speak("হ্যালো! আমি কাজল। আপনার মিষ্টি ও আন্তরিক বাংলা ভয়েস অ্যাসিস্ট্যান্ট।")
    }
}
