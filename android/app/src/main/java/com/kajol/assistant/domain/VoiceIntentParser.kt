package com.kajol.assistant.domain

import com.kajol.assistant.data.model.DeviceFeature
import com.kajol.assistant.data.model.VoiceIntent
import com.kajol.assistant.data.model.VolumeLevel
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VoiceIntentParser @Inject constructor() {

    fun parse(rawInput: String): VoiceIntent {
        val text = rawInput.trim().lowercase()
        if (text.isEmpty()) return VoiceIntent.Unknown

        // 1. YouTube & Music playback
        if (text.contains("গান চালাও") || text.contains("গান বাজাও") ||
            text.contains("ইউটিউবে") || text.contains("youtube") ||
            text.contains("প্লে করো") || text.contains("play")
        ) {
            val query = text
                .replace("ইউটিউবে গান চালাও", "")
                .replace("ইউটিউবে চালাও", "")
                .replace("গান চালাও", "")
                .replace("গান বাজাও", "")
                .replace("ইউটিউবে সার্চ করো", "")
                .replace("youtube এ", "")
                .replace("play song", "")
                .replace("play", "")
                .trim()
            return VoiceIntent.PlayYouTube(if (query.isEmpty()) "Bangla popular songs" else query)
        }

        // 2. Flashlight / Torch
        if (text.contains("ফ্ল্যাশলাইট") || text.contains("টর্চ") || text.contains("torch") || text.contains("flashlight")) {
            val enable = !(text.contains("বন্ধ") || text.contains("অফ") || text.contains("off"))
            return VoiceIntent.ToggleDeviceFeature(DeviceFeature.FLASHLIGHT, enable)
        }

        // 3. Wi-Fi
        if (text.contains("ওয়াইফাই") || text.contains("ওয়াই-ফাই") || text.contains("wifi") || text.contains("wi-fi")) {
            val enable = !(text.contains("বন্ধ") || text.contains("অফ") || text.contains("off"))
            return VoiceIntent.ToggleDeviceFeature(DeviceFeature.WIFI, enable)
        }

        // 4. Bluetooth
        if (text.contains("ব্লুটুথ") || text.contains("bluetooth")) {
            val enable = !(text.contains("বন্ধ") || text.contains("অফ") || text.contains("off"))
            return VoiceIntent.ToggleDeviceFeature(DeviceFeature.BLUETOOTH, enable)
        }

        // 5. Volume controls
        if (text.contains("ভলিউম") || text.contains("আওয়াজ") || text.contains("সাউন্ড") || text.contains("volume")) {
            return when {
                text.contains("বাড়িয়ে") || text.contains("বাড়াও") || text.contains("up") -> VoiceIntent.AdjustVolume(VolumeLevel.UP)
                text.contains("কমিয়ে") || text.contains("কমাও") || text.contains("down") -> VoiceIntent.AdjustVolume(VolumeLevel.DOWN)
                text.contains("মিউট") || text.contains("বন্ধ") || text.contains("mute") -> VoiceIntent.AdjustVolume(VolumeLevel.MUTE)
                text.contains("সর্বোচ্চ") || text.contains("ফুল") || text.contains("max") -> VoiceIntent.AdjustVolume(VolumeLevel.MAX)
                else -> VoiceIntent.AdjustVolume(VolumeLevel.UP)
            }
        }

        // 6. Do Not Disturb
        if (text.contains("বিরক্ত করো না") || text.contains("ডিস্টার্ব") || text.contains("dnd") || text.contains("do not disturb")) {
            val enable = !(text.contains("বন্ধ") || text.contains("অফ") || text.contains("off"))
            return VoiceIntent.ToggleDeviceFeature(DeviceFeature.DND, enable)
        }

        // 7. Make a Phone Call
        if (text.contains("কল দাও") || text.contains("কল করো") || text.contains("ফোন দাও") || text.contains("ফোন করো") || text.contains("call")) {
            val contact = text
                .replace("কল দাও", "")
                .replace("কল করো", "")
                .replace("ফোন দাও", "")
                .replace("ফোন করো", "")
                .replace("call to", "")
                .replace("call", "")
                .replace("কে", "")
                .trim()
            return VoiceIntent.MakeCall(contact)
        }

        // 8. Send SMS
        if (text.contains("মেসেজ পাঠাও") || text.contains("এসএমএস করো") || text.contains("sms পাঠাও") || text.contains("send sms")) {
            val parts = text.split("বলবে|বলে|message".toRegex())
            val recipient = parts[0]
                .replace("মেসেজ পাঠাও", "")
                .replace("এসএমএস করো", "")
                .replace("কে", "")
                .trim()
            val msgBody = if (parts.size > 1) parts[1].trim() else "হ্যালো, কেমন আছেন?"
            return VoiceIntent.SendSms(recipient, msgBody)
        }

        // 9. Alarm
        if (text.contains("অ্যালার্ম") || text.contains("এলার্ম") || text.contains("alarm")) {
            // Extract hour and minute if mentioned
            var hour = 7
            var minute = 0
            if (text.contains("সকাল")) hour = 7
            if (text.contains("রাত") || text.contains("সন্ধ্যা")) hour = 20
            
            // Regex for numbers in Bengali or English
            val numbers = Regex("(\\d+)").find(text)?.value?.toIntOrNull()
            if (numbers != null && numbers in 1..24) {
                hour = numbers
            }
            return VoiceIntent.SetAlarm(hour, minute, "কাজল অ্যালার্ম")
        }

        // 10. Timer
        if (text.contains("টাইমার") || text.contains("timer")) {
            val minutes = Regex("(\\d+)").find(text)?.value?.toIntOrNull() ?: 5
            return VoiceIntent.SetTimer(minutes * 60, "কাজল টাইমার")
        }

        // 11. Reminder
        if (text.contains("মনে করিয়ে") || text.contains("রিমাইন্ডার") || text.contains("reminder")) {
            val title = text
                .replace("মনে করিয়ে দাও", "")
                .replace("রিমাইন্ডার দাও", "")
                .replace("reminder", "")
                .trim()
            return VoiceIntent.SetReminder(if (title.isEmpty()) "কাজল রিমাইন্ডার" else title, 30)
        }

        // 12. Camera
        if (text.contains("ক্যামেরা") || text.contains("ছবি তোল") || text.contains("ছবি তুলব") || text.contains("camera")) {
            return VoiceIntent.OpenCamera
        }

        // 13. Weather
        if (text.contains("আবহাওয়া") || text.contains("বৃষ্টি") || text.contains("গরম") || text.contains("weather")) {
            return VoiceIntent.GetWeather
        }

        // 14. Time & Date
        if (text.contains("কয়টা বাজে") || text.contains("সময় কত") || text.contains("আজকে কত তারিখ") ||
            text.contains("আজ কী বার") || text.contains("time") || text.contains("date")
        ) {
            return VoiceIntent.GetTimeAndDate
        }

        // 15. Maps & Navigation
        if (text.contains("রাস্তা দেখাও") || text.contains("ম্যাপে") || text.contains("নেভিগেশন") || text.contains("maps") || text.contains("directions")) {
            val destination = text
                .replace("ম্যাপে", "")
                .replace("রাস্তা দেখাও", "")
                .replace("যাওয়ার", "")
                .replace("নেভিগেশন খোলো", "")
                .replace("এর", "")
                .trim()
            return VoiceIntent.OpenMaps(destination)
        }

        // 16. App Launcher (Facebook, WhatsApp, YouTube, Chrome, Settings, etc.)
        if (text.contains("খোলো") || text.contains("ওপেন করো") || text.contains("চালু করো") || text.contains("open")) {
            val appName = text
                .replace("খোলো", "")
                .replace("ওপেন করো", "")
                .replace("চালু করো", "")
                .replace("অ্যাপ", "")
                .replace("open", "")
                .trim()
            if (appName.isNotEmpty()) {
                return VoiceIntent.OpenApp(appName)
            }
        }

        // 17. Google Search
        if (text.contains("গুগলে সার্চ") || text.contains("সার্চ করো") || text.contains("খোঁজ করো") || text.contains("google search")) {
            val query = text
                .replace("গুগলে সার্চ করো", "")
                .replace("গুগলে খোঁজ করো", "")
                .replace("সার্চ করো", "")
                .replace("খোঁজ করো", "")
                .trim()
            return VoiceIntent.SearchGoogle(query)
        }

        // 18. Take Notes
        if (text.contains("নোট নাও") || text.contains("লিখে রাখো") || text.contains("নোট রাখো") || text.contains("take note")) {
            val note = text
                .replace("নোট নাও", "")
                .replace("লিখে রাখো", "")
                .replace("নোট রাখো", "")
                .trim()
            return VoiceIntent.TakeNote(if (note.isEmpty()) "নতুন নোট" else note)
        }

        // 19. Fallback to Gemini for general conversation, Q&A, and translations
        return VoiceIntent.GeneralConversation(rawInput)
    }
}
