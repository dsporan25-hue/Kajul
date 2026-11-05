package com.kajol.assistant.service

import android.app.KeyguardManager
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.kajol.assistant.KajolApplication
import com.kajol.assistant.R
import com.kajol.assistant.data.preferences.KajolPreferences
import com.kajol.assistant.domain.SystemActionExecutor
import com.kajol.assistant.domain.VoiceIntentParser
import com.kajol.assistant.ui.LockScreenVoiceActivity
import com.kajol.assistant.ui.MainActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class KajolVoiceService : Service() {

    @Inject lateinit var speechRecognizer: BengaliSpeechRecognizer
    @Inject lateinit var ttsManager: BengaliTtsManager
    @Inject lateinit var intentParser: VoiceIntentParser
    @Inject lateinit var actionExecutor: SystemActionExecutor
    @Inject lateinit var preferences: KajolPreferences

    private var wakeLock: PowerManager.WakeLock? = null
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())

    private var currentWakePhrase = "হ্যালো কাজল"
    private var isAwaitingCommandAfterWakeWord = false

    override fun onCreate() {
        super.onCreate()
        acquireWakeLock()
        startAsForegroundService()
        initSpeechPipeline()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, motiveId: Int): Int {
        when (intent?.action) {
            ACTION_STOP_SERVICE -> {
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TRIGGER_LISTENING -> {
                listenForCommand()
            }
        }
        return START_STICKY
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "KajolAssistant::VoiceServiceWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(24 * 60 * 60 * 1000L) // 24 hours safeguard
        }
    }

    private fun startAsForegroundService() {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val stopIntent = Intent(this, KajolVoiceService::class.java).apply {
            action = ACTION_STOP_SERVICE
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, KajolApplication.VOICE_SERVICE_CHANNEL_ID)
            .setContentTitle("কাজল সক্রিয় রয়েছে")
            .setContentText("\"$currentWakePhrase\" বলে যেকোনো কিছু বলুন")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "বন্ধ করুন", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun initSpeechPipeline() {
        serviceScope.launch {
            currentWakePhrase = preferences.wakePhraseFlow.first().lowercase()
        }

        speechRecognizer.onSpeechResultListener = { spokenText ->
            handleSpokenText(spokenText)
        }

        speechRecognizer.startListening(continuous = true)
    }

    private fun handleSpokenText(text: String) {
        val lowerText = text.lowercase().trim()

        serviceScope.launch {
            val wakePhrase = preferences.wakePhraseFlow.first().lowercase()

            if (lowerText.contains(wakePhrase) || lowerText.contains("হ্যালো কাজল") || lowerText.contains("কাজল")) {
                // Wake phrase detected!
                val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                val isLocked = keyguardManager?.isKeyguardLocked ?: false

                if (isLocked) {
                    val lockIntent = Intent(this@KajolVoiceService, LockScreenVoiceActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                    }
                    startActivity(lockIntent)
                }

                // Check if command is chained directly e.g. "হ্যালো কাজল গান চালাও"
                val cleanedCommand = lowerText
                    .replace(wakePhrase, "")
                    .replace("হ্যালো কাজল", "")
                    .replace("কাজল", "")
                    .trim()

                if (cleanedCommand.isNotEmpty()) {
                    executeVoiceCommand(cleanedCommand)
                } else {
                    isAwaitingCommandAfterWakeWord = true
                    ttsManager.speak("হ্যাঁ, বলুন, আমি শুনছি।") {
                        // After prompt finishes, focus listening
                        speechRecognizer.startListening(continuous = false)
                    }
                }
            } else if (isAwaitingCommandAfterWakeWord) {
                isAwaitingCommandAfterWakeWord = false
                executeVoiceCommand(text)
            }
        }
    }

    private fun listenForCommand() {
        ttsManager.speak("কীভাবে সাহায্য করতে পারি?") {
            speechRecognizer.startListening(continuous = false)
        }
    }

    private fun executeVoiceCommand(commandText: String) {
        serviceScope.launch {
            val parsedIntent = intentParser.parse(commandText)
            val result = actionExecutor.execute(parsedIntent)
            ttsManager.speak(result.spokenResponse)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer.stopListening()
        speechRecognizer.destroy()
        ttsManager.stop()
        ttsManager.shutdown()
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID = 1001
        const val ACTION_STOP_SERVICE = "com.kajol.assistant.ACTION_STOP_SERVICE"
        const val ACTION_TRIGGER_LISTENING = "com.kajol.assistant.ACTION_TRIGGER_LISTENING"

        fun start(context: Context) {
            val intent = Intent(context, KajolVoiceService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, KajolVoiceService::class.java)
            context.stopService(intent)
        }
    }
}
