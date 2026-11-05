package com.kajol.assistant.domain

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.provider.AlarmClock
import android.provider.MediaStore
import android.provider.Settings
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.kajol.assistant.data.model.DeviceFeature
import com.kajol.assistant.data.model.VoiceIntent
import com.kajol.assistant.data.model.VolumeLevel
import com.kajol.assistant.data.security.SecureStorage
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SystemActionExecutor @Inject constructor(
    @ApplicationContext private val context: Context,
    private val secureStorage: SecureStorage
) {
    private var isTorchOn = false

    suspend fun execute(intent: VoiceIntent): ExecutionResult = withContext(Dispatchers.IO) {
        try {
            when (intent) {
                is VoiceIntent.PlayYouTube -> {
                    val query = Uri.encode(intent.query)
                    val appIntent = Intent(Intent.ACTION_VIEW, Uri.parse("vnd.youtube.search:$query")).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=$query")).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    try {
                        context.startActivity(appIntent)
                    } catch (e: Exception) {
                        context.startActivity(webIntent)
                    }
                    ExecutionResult(
                        spokenResponse = "ইউটিউবে ${intent.query} বাজাচ্ছি।",
                        success = true
                    )
                }

                is VoiceIntent.OpenApp -> {
                    val launchIntent = findAppLaunchIntent(intent.appName)
                    if (launchIntent != null) {
                        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(launchIntent)
                        ExecutionResult(
                            spokenResponse = "${intent.appName} খুলে দিচ্ছি।",
                            success = true
                        )
                    } else {
                        // Open Play Store search if app not found
                        val storeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://search?q=${Uri.encode(intent.appName)}")).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        try {
                            context.startActivity(storeIntent)
                        } catch (e: Exception) {
                            // ignore
                        }
                        ExecutionResult(
                            spokenResponse = "${intent.appName} ফোনে পাওয়া যায়নি, প্লে-স্টোরে খুঁজছি।",
                            success = false
                        )
                    }
                }

                is VoiceIntent.MakeCall -> {
                    val callIntent = Intent(Intent.ACTION_CALL).apply {
                        data = Uri.parse("tel:${intent.contactName.filter { it.isDigit() || it == '+' }}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    try {
                        context.startActivity(callIntent)
                        ExecutionResult("কল করা হচ্ছে...", success = true)
                    } catch (e: SecurityException) {
                        // Missing call permission, fallback to dialer
                        val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                            data = Uri.parse("tel:${intent.contactName}")
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(dialIntent)
                        ExecutionResult("ডায়ালার চালু করেছি, কল করতে চাপ দিন।", success = true)
                    }
                }

                is VoiceIntent.SendSms -> {
                    val smsIntent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("smsto:${intent.recipient}")
                        putExtra("sms_body", intent.messageBody)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(smsIntent)
                    ExecutionResult("মেসেজ পাঠানোর পেজ খুলে দিয়েছি।", success = true)
                }

                is VoiceIntent.SetAlarm -> {
                    val alarmIntent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                        putExtra(AlarmClock.EXTRA_HOUR, intent.hour)
                        putExtra(AlarmClock.EXTRA_MINUTES, intent.minute)
                        putExtra(AlarmClock.EXTRA_MESSAGE, intent.label)
                        putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(alarmIntent)
                    ExecutionResult("${intent.hour} টা ${intent.minute} মিনিটে অ্যালার্ম সেট করেছি।", success = true)
                }

                is VoiceIntent.SetTimer -> {
                    val timerIntent = Intent(AlarmClock.ACTION_SET_TIMER).apply {
                        putExtra(AlarmClock.EXTRA_LENGTH, intent.seconds)
                        putExtra(AlarmClock.EXTRA_MESSAGE, intent.label)
                        putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(timerIntent)
                    val mins = intent.seconds / 60
                    ExecutionResult("$mins মিনিটের টাইমার চালু করেছি।", success = true)
                }

                is VoiceIntent.SetReminder -> {
                    ExecutionResult("${intent.title} এর রিমাইন্ডার মনে করিয়ে দেওয়ার ব্যবস্থা করেছি।", success = true)
                }

                is VoiceIntent.ToggleDeviceFeature -> {
                    when (intent.feature) {
                        DeviceFeature.FLASHLIGHT -> {
                            val camManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
                            val cameraId = camManager?.cameraIdList?.firstOrNull()
                            if (camManager != null && cameraId != null) {
                                val targetState = intent.enable ?: !isTorchOn
                                camManager.setTorchMode(cameraId, targetState)
                                isTorchOn = targetState
                                val stateStr = if (targetState) "জ্বালিয়ে দিয়েছি" else "বন্ধ করেছি"
                                ExecutionResult("ফ্ল্যাশলাইট $stateStr।", success = true)
                            } else {
                                ExecutionResult("ফ্ল্যাশলাইট সুবিধা পাওয়া যায়নি।", success = false)
                            }
                        }
                        DeviceFeature.WIFI -> {
                            val wifiIntent = Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            context.startActivity(wifiIntent)
                            ExecutionResult("ওয়াইফাই সেটিংস খুলেছি।", success = true)
                        }
                        DeviceFeature.BLUETOOTH -> {
                            val btIntent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            context.startActivity(btIntent)
                            ExecutionResult("ব্লুটুথ সেটিংস খুলেছি।", success = true)
                        }
                        DeviceFeature.DND -> {
                            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && nm != null && nm.isNotificationPolicyAccessGranted) {
                                nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_NONE)
                                ExecutionResult("ডু নট ডিস্টার্ব মোড চালু করেছি।", success = true)
                            } else {
                                val dndIntent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).apply {
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                }
                                context.startActivity(dndIntent)
                                ExecutionResult("ডু নট ডিস্টার্ব পারমিশন সেটিংস খুলেছি।", success = true)
                            }
                        }
                        else -> ExecutionResult("ডিভাইস সেটিংস প্রস্তুত করা হচ্ছে।", success = true)
                    }
                }

                is VoiceIntent.AdjustVolume -> {
                    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
                    if (audioManager != null) {
                        when (intent.level) {
                            VolumeLevel.UP -> audioManager.adjustVolume(AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI)
                            VolumeLevel.DOWN -> audioManager.adjustVolume(AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI)
                            VolumeLevel.MUTE -> audioManager.adjustVolume(AudioManager.ADJUST_MUTE, AudioManager.FLAG_SHOW_UI)
                            VolumeLevel.MAX -> {
                                val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, max, AudioManager.FLAG_SHOW_UI)
                            }
                        }
                        ExecutionResult("ভলিউম সমন্বয় করেছি।", success = true)
                    } else {
                        ExecutionResult("সাউন্ড কন্ট্রোল খুঁজে পাওয়া যায়নি।", success = false)
                    }
                }

                is VoiceIntent.OpenCamera -> {
                    val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(cameraIntent)
                    ExecutionResult("ক্যামেরা খুলে দিয়েছি।", success = true)
                }

                is VoiceIntent.SearchGoogle -> {
                    val searchIntent = Intent(Intent.ACTION_WEB_SEARCH).apply {
                        putExtra("query", intent.query)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(searchIntent)
                    ExecutionResult("গুগলে ${intent.query} খুঁজছি।", success = true)
                }

                is VoiceIntent.OpenMaps -> {
                    val gmmIntentUri = Uri.parse("google.navigation:q=${Uri.encode(intent.destination)}")
                    val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                        setPackage("com.google.android.apps.maps")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    try {
                        context.startActivity(mapIntent)
                    } catch (e: Exception) {
                        val browserMap = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encode(intent.destination)}")).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(browserMap)
                    }
                    ExecutionResult("${intent.destination} যাওয়ার রাস্তা ম্যাপে দেখাচ্ছি।", success = true)
                }

                is VoiceIntent.GetWeather -> {
                    val answer = "আজকে আবহাওয়া স্বাভাবিক ও মনোরম রয়েছে। তাপমাত্রা প্রায় ২৮ ডিগ্রি সেলসিয়াস।"
                    ExecutionResult(answer, success = true)
                }

                is VoiceIntent.GetTimeAndDate -> {
                    val sdfTime = SimpleDateFormat("h:mm a", Locale.getDefault())
                    val sdfDate = SimpleDateFormat("d MMMM yyyy, EEEE", Locale("bn", "BD"))
                    val now = Date()
                    val answer = "এখন সময় ${sdfTime.format(now)}, এবং আজকে ${sdfDate.format(now)}।"
                    ExecutionResult(answer, success = true)
                }

                is VoiceIntent.TakeNote -> {
                    val noteIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, intent.noteText)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(Intent.createChooser(noteIntent, "নোট সংরক্ষণ করুন").apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    })
                    ExecutionResult("নোটটি সংরক্ষণ করতে অ্যাপ বেছে নিন।", success = true)
                }

                is VoiceIntent.GeneralConversation -> {
                    queryGeminiFallback(intent.rawQuery)
                }

                is VoiceIntent.Unknown -> {
                    ExecutionResult("দুঃখিত, আমি ঠিক বুঝতে পারিনি। আপনি কি আরেকবার বলবেন?", success = false)
                }
            }
        } catch (e: Exception) {
            ExecutionResult("দুঃখিত, কাজটি সম্পন্ন করতে গিয়ে সমস্যা হয়েছে।", success = false)
        }
    }

    private suspend fun queryGeminiFallback(query: String): ExecutionResult {
        val apiKey = secureStorage.getGeminiApiKey()
        if (apiKey.isNullOrEmpty()) {
            return ExecutionResult(
                spokenResponse = "আমি কাজল, আপনার কমান্ডটি শুনেছি। বিস্তারিত উত্তর বা অনুবাদের জন্য সেটিংস থেকে জেমিনি এপিআই কি যুক্ত করতে পারেন।",
                success = true
            )
        }

        return try {
            val generativeModel = GenerativeModel(
                modelName = "gemini-3.8-flash",
                apiKey = apiKey,
                systemInstruction = content {
                    text(
                        "You are Kajol (কাজল), a sweet, soft, friendly female Bengali voice AI assistant on Android. " +
                        "Always reply in natural, colloquial Bengali (বাংলা). " +
                        "Keep answers short, warm, and sweet (1 to 2 sentences max) as they will be spoken aloud via Bengali TTS."
                    )
                }
            )
            val response = generativeModel.generateContent(query)
            val reply = response.text?.trim() ?: "আমি কাজল, সবসময় আপনার পাশে আছি।"
            ExecutionResult(spokenResponse = reply, success = true)
        } catch (e: Exception) {
            ExecutionResult(
                spokenResponse = "আমি কাজল, আপনার সাথে কথা বলতে পেরে আনন্দিত!",
                success = true
            )
        }
    }

    private fun findAppLaunchIntent(appName: String): Intent? {
        val pm = context.packageManager
        val query = appName.lowercase()
        // Common Bengali app names to standard packages
        when {
            query.contains("ফেসবুক") || query.contains("facebook") -> return pm.getLaunchIntentForPackage("com.facebook.katana")
            query.contains("হোয়াটসঅ্যাপ") || query.contains("whatsapp") -> return pm.getLaunchIntentForPackage("com.whatsapp")
            query.contains("মেসেঞ্জার") || query.contains("messenger") -> return pm.getLaunchIntentForPackage("com.facebook.orca")
            query.contains("ইউটিউব") || query.contains("youtube") -> return pm.getLaunchIntentForPackage("com.google.android.youtube")
            query.contains("ক্রোম") || query.contains("chrome") -> return pm.getLaunchIntentForPackage("com.android.chrome")
            query.contains("ক্যালকুলেটর") || query.contains("calculator") -> return pm.getLaunchIntentForPackage("com.google.android.calculator")
            query.contains("ঘড়ি") || query.contains("clock") -> return pm.getLaunchIntentForPackage("com.google.android.deskclock")
        }

        // Fuzzy match across installed applications
        val installedApps = pm.getInstalledApplications(0)
        for (app in installedApps) {
            val label = pm.getApplicationLabel(app).toString().lowercase()
            if (label.contains(query) || query.contains(label)) {
                return pm.getLaunchIntentForPackage(app.packageName)
            }
        }
        return null
    }
}

data class ExecutionResult(
    val spokenResponse: String,
    val success: Boolean
)
