package com.kajol.assistant.data.security

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
            // Fallback to standard private mode if crypto provider is compromised or keystore resets
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
}
