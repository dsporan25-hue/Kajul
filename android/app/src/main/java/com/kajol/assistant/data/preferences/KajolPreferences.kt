package com.kajol.assistant.data.preferences

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

    val hasOnboardedFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[HAS_ONBOARDED_KEY] ?: false
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

    suspend fun setHasOnboarded(onboarded: Boolean) {
        context.dataStore.edit { it[HAS_ONBOARDED_KEY] = onboarded }
    }
}
