package com.kajol.assistant

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class KajolApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                VOICE_SERVICE_CHANNEL_ID,
                "কাজল ভয়েস সার্ভিস (Kajol Voice Service)",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "ভয়েস কমান্ড শোনার জন্য ব্যাকগ্রাউন্ড সার্ভিস চ্যানেল"
                setShowBadge(false)
            }

            val alertChannel = NotificationChannel(
                ALERT_CHANNEL_ID,
                "কাজল নোটিফিকেশন ও অ্যালার্ট",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "জরুরি উত্তর ও কমান্ড নোটিফিকেশন"
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
            manager?.createNotificationChannel(alertChannel)
        }
    }

    companion object {
        const val VOICE_SERVICE_CHANNEL_ID = "kajol_voice_foreground_channel"
        const val ALERT_CHANNEL_ID = "kajol_alert_channel"
    }
}
