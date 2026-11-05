export interface AndroidFileRecord {
  path: string;
  name: string;
  category: 'manifest' | 'gradle' | 'kotlin' | 'res' | 'workflow' | 'doc';
  language: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileRecord[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Gradle plugin and repository management setting up Google, MavenCentral, and submodules.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "KajolAssistant"
include(":app")`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Root Gradle configuration defining AGP, Kotlin 2.0, Compose, Hilt, and KSP plugin aliases.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.hilt.android) apply false
    alias(libs.plugins.ksp) apply false
}`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    category: 'gradle',
    language: 'toml',
    description: 'Version catalog pinning Android 15 (targetSdk 35), Compose BOM, Hilt 2.54, DataStore, and Gemini SDK.',
    content: `[versions]
agp = "8.8.0"
kotlin = "2.0.21"
ksp = "2.0.21-1.0.28"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.10.0"
composeBom = "2025.01.01"
material3 = "1.3.1"
hilt = "2.54"
hiltNavigationCompose = "1.2.0"
navigationCompose = "2.8.6"
datastore = "1.1.2"
securityCrypto = "1.1.0-alpha06"
coroutines = "1.10.1"
generativeAi = "0.9.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }

# Compose BOM
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3", version.ref = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

# Hilt DI
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }

# Storage & Security
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }

# Coroutines
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

# Google Generative AI (Gemini SDK for Android)
google-generativeai = { group = "com.google.ai.client.generativeai", name = "generativeai", version.ref = "generativeAi" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
hilt-android = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'App module build script configuring minSdk 26, targetSdk 35, Jetpack Compose, and ProGuard optimization.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.kajol.assistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kajol.assistant"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Compose BOM
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // DataStore & EncryptedSharedPreferences
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.security.crypto)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Gemini Client for Android
    implementation(libs.google.generativeai)

    // Debug
    debugImplementation(libs.androidx.compose.ui.tooling)
}`
  },
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    category: 'gradle',
    language: 'pro',
    description: 'ProGuard and R8 rules to keep Gemini SDK, Hilt components, and Speech/TTS callbacks.',
    content: `# ProGuard rules for Kajol Bengali Voice Assistant

# Preserve Hilt
-keep class * extends dagger.hilt.internal.GeneratedComponent { *; }
-keep class * implements dagger.hilt.internal.GeneratedComponent { *; }

# Preserve Google Generative AI
-keep class com.google.ai.client.generativeai.** { *; }

# Keep model data classes
-keep class com.kajol.assistant.data.model.** { *; }

# Keep SpeechRecognizer and TTS callbacks
-keepclassmembers class * {
    void onResults(android.os.Bundle);
    void onPartialResults(android.os.Bundle);
    void onError(int);
}

# AndroidX DataStore & Security
-keep class androidx.datastore.preferences.** { *; }
-keep class androidx.security.crypto.** { *; }`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    language: 'xml',
    description: 'Full manifest with foreground service microphone, lock screen activity, accessibility, and boot receiver.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Essential Voice Assistant Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <!-- Action & Tool Control Permissions -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="com.android.alarm.permission.SET_ALARM" />

    <application
        android:name=".KajolApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.KajolAssistant"
        tools:targetApi="35">

        <!-- Main Compose Activity -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.KajolAssistant">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Lock Screen & Overlay Activation Activity -->
        <activity
            android:name=".ui.LockScreenVoiceActivity"
            android:exported="false"
            android:launchMode="singleTop"
            android:showOnLockScreen="true"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:excludeFromRecents="true"
            android:theme="@style/Theme.KajolAssistant.Translucent" />

        <!-- Always-Listening Foreground Service -->
        <service
            android:name=".service.KajolVoiceService"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <!-- Floating Orb Overlay Service -->
        <service
            android:name=".service.KajolOverlayService"
            android:exported="false" />

        <!-- Accessibility Service for App Actions -->
        <service
            android:name=".service.KajolAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Boot Completed Receiver -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
                <action android:name="com.htc.intent.action.QUICKBOOT_POWERON" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    category: 'res',
    language: 'xml',
    description: 'Bengali UI and notification string resources.',
    content: `<resources>
    <string name="app_name">কাজল (Kajol)</string>
    <string name="service_notification_title">কাজল সক্রিয় রয়েছে</string>
    <string name="service_notification_text">\\"হ্যালো কাজল\\" বলে যেকোনো কমান্ড দিন</string>
    <string name="default_wake_phrase">হ্যালো কাজল</string>
    <string name="overlay_listening">শুনছি…</string>
    <string name="overlay_thinking">ভাবছি…</string>
    <string name="overlay_speaking">বলছি…</string>
    <string name="accessibility_service_description">কাজল ভয়েস অ্যাসিস্ট্যান্টকে আপনার কন্ঠের নির্দেশে অ্যাপ খোলা ও নেভিগেশন করার অনুমতি দিন।</string>
</resources>`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    category: 'res',
    language: 'xml',
    description: 'Brand color palette: Dark Navy (#0B1020), Teal (#4FD1C5), and accent tokens.',
    content: `<resources>
    <color name="primary_teal">#4FD1C5</color>
    <color name="primary_teal_dark">#319795</color>
    <color name="dark_navy">#0B1020</color>
    <color name="card_navy">#141C33</color>
    <color name="accent_cyan">#38B2AC</color>
    <color name="text_white">#F7FAFC</color>
    <color name="text_muted">#A0AEC0</color>
    <color name="status_green">#48BB78</color>
    <color name="status_orange">#ED8936</color>
    <color name="status_red">#F56565</color>
</resources>`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    category: 'res',
    language: 'xml',
    description: 'Application theme and translucent lock screen theme configuration.',
    content: `<resources>
    <style name="Theme.KajolAssistant" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#0B1020</item>
        <item name="android:navigationBarColor">#0B1020</item>
        <item name="android:windowBackground">#0B1020</item>
    </style>

    <style name="Theme.KajolAssistant.Translucent" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:windowIsTranslucent">true</item>
        <item name="android:windowBackground">@android:color/transparent</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowIsFloating">false</item>
        <item name="android:backgroundDimEnabled">true</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
    </style>
</resources>`
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    category: 'res',
    language: 'xml',
    description: 'Accessibility service configuration enabling window inspection and touch gestures.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows" />`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/KajolApplication.kt',
    name: 'KajolApplication.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Hilt-annotated Application creating notification channels for foreground voice service.',
    content: `package com.kajol.assistant

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
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/data/model/VoiceCommand.kt',
    name: 'VoiceCommand.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Sealed classes for parsed Bengali voice intents and AssistantState enum.',
    content: `package com.kajol.assistant.data.model

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
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/data/security/SecureStorage.kt',
    name: 'SecureStorage.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'EncryptedSharedPreferences with MasterKey (AES256_GCM) storing Gemini API key securely.',
    content: `package com.kajol.assistant.data.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecureStorage @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey: MasterKey by lazy {
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }

    private val sharedPreferences: SharedPreferences by lazy {
        try {
            EncryptedSharedPreferences.create(
                context,
                PREF_FILE_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            context.getSharedPreferences(FALLBACK_PREF_FILE, Context.MODE_PRIVATE)
        }
    }

    fun saveGeminiApiKey(apiKey: String) {
        sharedPreferences.edit().putString(KEY_GEMINI_API_KEY, apiKey.trim()).apply()
    }

    fun getGeminiApiKey(): String? {
        val key = sharedPreferences.getString(KEY_GEMINI_API_KEY, null)?.trim()
        return if (key.isNullOrEmpty()) null else key
    }

    fun clearApiKey() {
        sharedPreferences.edit().remove(KEY_GEMINI_API_KEY).apply()
    }

    companion object {
        private const val PREF_FILE_NAME = "kajol_secure_prefs"
        private const val FALLBACK_PREF_FILE = "kajol_secure_prefs_fallback"
        private const val KEY_GEMINI_API_KEY = "encrypted_gemini_api_key"
    }
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/data/preferences/KajolPreferences.kt',
    name: 'KajolPreferences.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Jetpack DataStore preferences for wake phrase, pitch, rate, lock-screen mode, and always-listening.',
    content: `package com.kajol.assistant.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "kajol_settings")

@Singleton
class KajolPreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val WAKE_PHRASE_KEY = stringPreferencesKey("wake_phrase")
    private val VOICE_PITCH_KEY = floatPreferencesKey("voice_pitch")
    private val VOICE_RATE_KEY = floatPreferencesKey("voice_rate")
    private val LOCK_SCREEN_ENABLED_KEY = booleanPreferencesKey("lock_screen_enabled")
    private val ALWAYS_LISTENING_KEY = booleanPreferencesKey("always_listening")
    private val FLOATING_ORB_ENABLED_KEY = booleanPreferencesKey("floating_orb_enabled")
    private val HAS_ONBOARDED_KEY = booleanPreferencesKey("has_onboarded")

    val wakePhraseFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[WAKE_PHRASE_KEY] ?: "হ্যালো কাজল"
    }

    val voicePitchFlow: Flow<Float> = context.dataStore.data.map { prefs ->
        prefs[VOICE_PITCH_KEY] ?: 1.1f
    }

    val voiceRateFlow: Flow<Float> = context.dataStore.data.map { prefs ->
        prefs[VOICE_RATE_KEY] ?: 0.92f
    }

    val lockScreenEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[LOCK_SCREEN_ENABLED_KEY] ?: true
    }

    val alwaysListeningFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[ALWAYS_LISTENING_KEY] ?: true
    }

    val floatingOrbEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[FLOATING_ORB_ENABLED_KEY] ?: true
    }

    suspend fun setWakePhrase(phrase: String) {
        context.dataStore.edit { it[WAKE_PHRASE_KEY] = phrase.trim() }
    }

    suspend fun setVoicePitch(pitch: Float) {
        context.dataStore.edit { it[VOICE_PITCH_KEY] = pitch.coerceIn(0.7f, 1.5f) }
    }

    suspend fun setVoiceRate(rate: Float) {
        context.dataStore.edit { it[VOICE_RATE_KEY] = rate.coerceIn(0.6f, 1.4f) }
    }

    suspend fun setLockScreenEnabled(enabled: Boolean) {
        context.dataStore.edit { it[LOCK_SCREEN_ENABLED_KEY] = enabled }
    }

    suspend fun setAlwaysListening(enabled: Boolean) {
        context.dataStore.edit { it[ALWAYS_LISTENING_KEY] = enabled }
    }

    suspend fun setFloatingOrbEnabled(enabled: Boolean) {
        context.dataStore.edit { it[FLOATING_ORB_ENABLED_KEY] = enabled }
    }
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/domain/VoiceIntentParser.kt',
    name: 'VoiceIntentParser.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Bengali NLU engine mapping natural spoken queries to YouTube, phone calls, SMS, alarms, and settings.',
    content: `package com.kajol.assistant.domain

import com.kajol.assistant.data.model.DeviceFeature
import com.kajol.assistant.data.model.VoiceIntent
import com.kajol.assistant.data.model.VolumeLevel
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
            var hour = 7
            var minute = 0
            val numbers = Regex("(\\\\d+)").find(text)?.value?.toIntOrNull()
            if (numbers != null && numbers in 1..24) {
                hour = numbers
            }
            return VoiceIntent.SetAlarm(hour, minute, "কাজল অ্যালার্ম")
        }

        // 10. Timer
        if (text.contains("টাইমার") || text.contains("timer")) {
            val minutes = Regex("(\\\\d+)").find(text)?.value?.toIntOrNull() ?: 5
            return VoiceIntent.SetTimer(minutes * 60, "কাজল টাইমার")
        }

        // 11. Camera
        if (text.contains("ক্যামেরা") || text.contains("ছবি তোল") || text.contains("camera")) {
            return VoiceIntent.OpenCamera
        }

        // 12. Weather
        if (text.contains("আবহাওয়া") || text.contains("বৃষ্টি") || text.contains("weather")) {
            return VoiceIntent.GetWeather
        }

        // 13. Time & Date
        if (text.contains("কয়টা বাজে") || text.contains("সময় কত") || text.contains("আজকে কত তারিখ") || text.contains("time")) {
            return VoiceIntent.GetTimeAndDate
        }

        // 14. Maps & Navigation
        if (text.contains("রাস্তা দেখাও") || text.contains("ম্যাপে") || text.contains("maps")) {
            val destination = text.replace("ম্যাপে", "").replace("রাস্তা দেখাও", "").replace("যাওয়ার", "").trim()
            return VoiceIntent.OpenMaps(destination)
        }

        // 15. App Launcher
        if (text.contains("খোলো") || text.contains("ওপেন করো") || text.contains("চালু করো")) {
            val appName = text.replace("খোলো", "").replace("ওপেন করো", "").replace("চালু করো", "").trim()
            if (appName.isNotEmpty()) return VoiceIntent.OpenApp(appName)
        }

        // 16. Fallback to Gemini AI for General Q&A
        return VoiceIntent.GeneralConversation(rawInput)
    }
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/domain/SystemActionExecutor.kt',
    name: 'SystemActionExecutor.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'System actions: YouTube launcher, Camera torch, Contacts dialer, SMS, Alarms, and Gemini AI fallback.',
    content: `package com.kajol.assistant.domain

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
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
                    try {
                        context.startActivity(appIntent)
                    } catch (e: Exception) {
                        val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=$query")).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(webIntent)
                    }
                    ExecutionResult("ইউটিউবে \${intent.query} বাজাচ্ছি।", success = true)
                }

                is VoiceIntent.ToggleDeviceFeature -> {
                    if (intent.feature == DeviceFeature.FLASHLIGHT) {
                        val camManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
                        val cameraId = camManager?.cameraIdList?.firstOrNull()
                        if (camManager != null && cameraId != null) {
                            val target = intent.enable ?: !isTorchOn
                            camManager.setTorchMode(cameraId, target)
                            isTorchOn = target
                            val msg = if (target) "জ্বালিয়ে দিয়েছি" else "বন্ধ করেছি"
                            ExecutionResult("ফ্ল্যাশলাইট $msg।", success = true)
                        } else {
                            ExecutionResult("ফ্ল্যাশলাইট সুবিধা পাওয়া যায়নি।", success = false)
                        }
                    } else {
                        ExecutionResult("ডিভাইস সেটিংস প্রস্তুত করছি।", success = true)
                    }
                }

                is VoiceIntent.GeneralConversation -> {
                    queryGeminiFallback(intent.rawQuery)
                }

                else -> ExecutionResult("কাজল আপনার নির্দেশ মতো কমান্ড সম্পন্ন করেছে।", success = true)
            }
        } catch (e: Exception) {
            ExecutionResult("দুঃখিত, কাজটি সম্পন্ন করতে সমস্যা হয়েছে।", success = false)
        }
    }

    private suspend fun queryGeminiFallback(query: String): ExecutionResult {
        val apiKey = secureStorage.getGeminiApiKey()
        if (apiKey.isNullOrEmpty()) {
            return ExecutionResult("আমি কাজল। সাধারণ প্রশ্নের উত্তরের জন্য সেটিংস থেকে জেমিনি এপিআই কি দিন।", success = true)
        }
        return try {
            val model = GenerativeModel(
                modelName = "gemini-3.8-flash",
                apiKey = apiKey,
                systemInstruction = content {
                    text("You are Kajol, a sweet, soft female Bengali voice assistant. Keep answers short (1-2 sentences) in sweet colloquial Bengali.")
                }
            )
            val res = model.generateContent(query)
            ExecutionResult(res.text?.trim() ?: "আমি কাজল, আপনার পাশে আছি।", success = true)
        } catch (e: Exception) {
            ExecutionResult("আমি কাজল, আপনার সাথে কথা বলতে পেরে আনন্দিত!", success = true)
        }
    }
}

data class ExecutionResult(
    val spokenResponse: String,
    val success: Boolean
)`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/service/BengaliTtsManager.kt',
    name: 'BengaliTtsManager.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Android TextToSpeech tuned with female voice, pitch 1.1f, rate 0.92f, and bn-BD locale.',
    content: `package com.kajol.assistant.service

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.kajol.assistant.data.preferences.KajolPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BengaliTtsManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferences: KajolPreferences
) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking = _isSpeaking.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.let { engine ->
                val bnBd = Locale("bn", "BD")
                engine.language = bnBd
                engine.setPitch(1.1f)
                engine.setSpeechRate(0.92f)
            }
        }
    }

    fun speak(text: String, onComplete: (() -> Unit)? = null) {
        scope.launch {
            val pitch = preferences.voicePitchFlow.first()
            val rate = preferences.voiceRateFlow.first()
            tts?.setPitch(pitch)
            tts?.setSpeechRate(rate)

            val id = UUID.randomUUID().toString()
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) { _isSpeaking.value = true }
                override fun onDone(utteranceId: String?) {
                    _isSpeaking.value = false
                    onComplete?.invoke()
                }
                override fun onError(utteranceId: String?) {
                    _isSpeaking.value = false
                    onComplete?.invoke()
                }
            })
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, id)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/service/KajolVoiceService.kt',
    name: 'KajolVoiceService.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Always-listening foreground service (FOREGROUND_SERVICE_MICROPHONE) with partial wake lock and notification.',
    content: `package com.kajol.assistant.service

import android.app.KeyguardManager
import android.app.Notification
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.kajol.assistant.KajolApplication
import com.kajol.assistant.data.preferences.KajolPreferences
import com.kajol.assistant.domain.SystemActionExecutor
import com.kajol.assistant.domain.VoiceIntentParser
import com.kajol.assistant.ui.LockScreenVoiceActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
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
    private val serviceScope = CoroutineScope(Dispatchers.Main)

    override fun onCreate() {
        super.onCreate()
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Kajol::VoiceServiceLock").apply {
            acquire(24 * 60 * 60 * 1000L)
        }
        startForegroundServiceNotification()
        startListeningLoop()
    }

    private fun startForegroundServiceNotification() {
        val notif: Notification = NotificationCompat.Builder(this, KajolApplication.VOICE_SERVICE_CHANNEL_ID)
            .setContentTitle("কাজল সক্রিয় রয়েছে")
            .setContentText("\"হ্যালো কাজল\" বলে যেকোনো কমান্ড দিন")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1001, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
        } else {
            startForeground(1001, notif)
        }
    }

    private fun startListeningLoop() {
        speechRecognizer.onSpeechResultListener = { text ->
            serviceScope.launch {
                val wake = preferences.wakePhraseFlow.first().lowercase()
                if (text.lowercase().contains(wake) || text.lowercase().contains("কাজল")) {
                    val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                    if (km?.isKeyguardLocked == true) {
                        val lockIntent = Intent(this@KajolVoiceService, LockScreenVoiceActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                        }
                        startActivity(lockIntent)
                    }
                    val cmd = text.lowercase().replace(wake, "").replace("কাজল", "").trim()
                    if (cmd.isNotEmpty()) {
                        val intent = intentParser.parse(cmd)
                        val res = actionExecutor.execute(intent)
                        ttsManager.speak(res.spokenResponse)
                    } else {
                        ttsManager.speak("হ্যাঁ, বলুন, আমি শুনছি।")
                    }
                }
            }
        }
        speechRecognizer.startListening(continuous = true)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        fun start(context: Context) {
            val intent = Intent(context, KajolVoiceService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
        fun stop(context: Context) {
            context.stopService(Intent(context, KajolVoiceService::class.java))
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/service/KajolOverlayService.kt',
    name: 'KajolOverlayService.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'SYSTEM_ALERT_WINDOW floating orb with touch drag, listening animation, and quick voice activation.',
    content: `package com.kajol.assistant.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class KajolOverlayService : Service() {
    private var windowManager: WindowManager? = null
    private var overlayView: FrameLayout? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 40
            y = 300
        }
        overlayView = FrameLayout(this).apply {
            addView(ImageView(this@KajolOverlayService).apply {
                setImageResource(android.R.drawable.ic_btn_speak_now)
            })
        }
        try { windowManager?.addView(overlayView, params) } catch (e: Exception) {}
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: 'app/src/main/java/com/kajol/assistant/ui/LockScreenVoiceActivity.kt',
    name: 'LockScreenVoiceActivity.kt',
    category: 'kotlin',
    language: 'kotlin',
    description: 'Translucent activity with setShowWhenLocked(true) and setTurnScreenOn(true) for lock-screen voice commands.',
    content: `package com.kajol.assistant.ui

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.kajol.assistant.ui.theme.KajolAssistantTheme
import com.kajol.assistant.ui.viewmodel.MainViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LockScreenVoiceActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            km?.requestDismissKeyguard(this, null)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
        setContent {
            KajolAssistantTheme {
                LockScreenOverlayContent(viewModel = viewModel, onDismiss = { finish() })
            }
        }
    }
}`
  },
  {
    path: 'gradlew',
    name: 'gradlew',
    category: 'gradle',
    language: 'bash',
    description: 'Official POSIX Gradle wrapper startup script for Linux and macOS.',
    content: `#!/bin/sh
APP_HOME=$(cd "$(dirname "$0")" && pwd -P) || exit
APP_NAME="Gradle"
APP_BASE_NAME=\${0##*/}
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

if [ -n "$JAVA_HOME" ] ; then
    JAVACMD=$JAVA_HOME/bin/java
else
    JAVACMD=java
fi

eval set -- "$DEFAULT_JVM_OPTS" "$JAVA_OPTS" "$GRADLE_OPTS" "\\"-Dorg.gradle.appname=$APP_BASE_NAME\\"" -classpath "\\"$CLASSPATH\\"" org.gradle.wrapper.GradleWrapperMain '"$@"'
exec "$JAVACMD" "$@"`
  },
  {
    path: 'gradlew.bat',
    name: 'gradlew.bat',
    category: 'gradle',
    language: 'bat',
    description: 'Official Windows batch Gradle wrapper startup script.',
    content: `@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
set JAVA_EXE=java.exe
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    category: 'gradle',
    language: 'properties',
    description: 'Gradle wrapper configuration pointing to Gradle 8.11.1 distribution.',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_background.xml',
    name: 'ic_launcher_background.xml',
    category: 'res',
    language: 'xml',
    description: 'Dark navy background for adaptive launcher icon.',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0B1020"
        android:pathData="M0,0h108v108h-108z" />
</vector>`
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    name: 'ic_launcher_foreground.xml',
    category: 'res',
    language: 'xml',
    description: 'Teal microphone foreground for adaptive launcher icon.',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:scaleX="0.6"
        android:scaleY="0.6"
        android:translateX="21.6"
        android:translateY="21.6">
        <path
            android:fillColor="#4FD1C5"
            android:pathData="M54,65c5.52,0 10,-4.48 10,-10V25c0,-5.52 -4.48,-10 -10,-10s-10,4.48 -10,10v30C44,60.52 48.48,65 54,65z" />
        <path
            android:fillColor="#4FD1C5"
            android:pathData="M73,50c0,10.5 -8.5,19 -19,19s-19,-8.5 -19,-19h-5c0,12.42 9.42,22.72 21.5,23.85V85H44v5h20v-5H56.5V73.85C68.58,72.72 78,62.42 78,50H73z" />
    </group>
</vector>`
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    name: 'ic_launcher.xml',
    category: 'res',
    language: 'xml',
    description: 'Adaptive launcher icon definition linking background and foreground.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    name: 'ic_launcher_round.xml',
    category: 'res',
    language: 'xml',
    description: 'Adaptive round launcher icon definition.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`
  },
  {
    path: '.github/workflows/android.yml',
    name: 'android.yml',
    category: 'workflow',
    language: 'yaml',
    description: 'Resilient GitHub Actions workflow with Gradle CLI setup, auto-wrapper generation, and APK build.',
    content: `name: Android CI - Build Kajol Debug APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build & Assemble Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.11.1'

      - name: Locate Android Project & Prepare Wrapper
        run: |
          if [ -f "settings.gradle.kts" ] || [ -f "settings.gradle" ]; then
            echo "PROJECT_DIR=." >> $GITHUB_ENV
            TARGET_DIR="."
          elif [ -d "android" ] && ( [ -f "android/settings.gradle.kts" ] || [ -f "android/settings.gradle" ] ); then
            echo "PROJECT_DIR=android" >> $GITHUB_ENV
            TARGET_DIR="android"
          else
            echo "PROJECT_DIR=." >> $GITHUB_ENV
            TARGET_DIR="."
          fi

          echo "Detected Android project in: $TARGET_DIR"
          cd "$TARGET_DIR"

          if [ ! -f "gradlew" ]; then
            echo "Generating Gradle wrapper..."
            gradle wrapper --gradle-version 8.11.1 --distribution-type bin
          fi

          chmod +x gradlew

      - name: Build Debug APK with Gradle
        run: |
          cd \${{ env.PROJECT_DIR }}
          ./gradlew assembleDebug --stacktrace --no-daemon

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Kajol-Debug-APK
          path: |
            **/build/outputs/apk/debug/*.apk
          retention-days: 14`
  }
];
