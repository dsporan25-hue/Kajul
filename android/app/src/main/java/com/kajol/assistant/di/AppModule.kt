package com.kajol.assistant.di

import android.content.Context
import com.kajol.assistant.data.preferences.KajolPreferences
import com.kajol.assistant.data.security.SecureStorage
import com.kajol.assistant.domain.SystemActionExecutor
import com.kajol.assistant.domain.VoiceIntentParser
import com.kajol.assistant.service.BengaliSpeechRecognizer
import com.kajol.assistant.service.BengaliTtsManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideSecureStorage(@ApplicationContext context: Context): SecureStorage {
        return SecureStorage(context)
    }

    @Provides
    @Singleton
    fun provideKajolPreferences(@ApplicationContext context: Context): KajolPreferences {
        return KajolPreferences(context)
    }

    @Provides
    @Singleton
    fun provideVoiceIntentParser(): VoiceIntentParser {
        return VoiceIntentParser()
    }

    @Provides
    @Singleton
    fun provideBengaliTtsManager(
        @ApplicationContext context: Context,
        preferences: KajolPreferences
    ): BengaliTtsManager {
        return BengaliTtsManager(context, preferences)
    }

    @Provides
    @Singleton
    fun provideBengaliSpeechRecognizer(
        @ApplicationContext context: Context
    ): BengaliSpeechRecognizer {
        return BengaliSpeechRecognizer(context)
    }

    @Provides
    @Singleton
    fun provideSystemActionExecutor(
        @ApplicationContext context: Context,
        secureStorage: SecureStorage
    ): SystemActionExecutor {
        return SystemActionExecutor(context, secureStorage)
    }
}
