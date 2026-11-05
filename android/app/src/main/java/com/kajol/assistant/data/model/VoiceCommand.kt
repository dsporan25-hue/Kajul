package com.kajol.assistant.data.model

sealed class VoiceIntent {
    data class PlayYouTube(val query: String) : VoiceIntent()
    data class OpenApp(val appName: String) : VoiceIntent()
    data class MakeCall(val contactName: String) : VoiceIntent()
    data class SendSms(val recipient: String, val messageBody: String) : VoiceIntent()
    data class SetAlarm(val hour: Int, val minute: Int, val label: String) : VoiceIntent()
    data class SetTimer(val seconds: Int, val label: String) : VoiceIntent()
    data class SetReminder(val title: String, val minutesLater: Int) : VoiceIntent()
    data class ToggleDeviceFeature(val feature: DeviceFeature, val enable: Boolean?) : VoiceIntent()
    data class AdjustVolume(val level: VolumeLevel) : VoiceIntent()
    data class SearchGoogle(val query: String) : VoiceIntent()
    data class OpenMaps(val destination: String) : VoiceIntent()
    object GetWeather : VoiceIntent()
    object GetTimeAndDate : VoiceIntent()
    object OpenCamera : VoiceIntent()
    data class TakeNote(val noteText: String) : VoiceIntent()
    data class GeneralConversation(val rawQuery: String) : VoiceIntent()
    object Unknown : VoiceIntent()
}

enum class DeviceFeature {
    WIFI,
    BLUETOOTH,
    FLASHLIGHT,
    DND,
    BRIGHTNESS
}

enum class VolumeLevel {
    UP,
    DOWN,
    MUTE,
    MAX
}

enum class AssistantState {
    IDLE,
    LISTENING,
    THINKING,
    SPEAKING,
    ERROR
}
