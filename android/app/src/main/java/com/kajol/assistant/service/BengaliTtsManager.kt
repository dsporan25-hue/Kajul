package com.kajol.assistant.service

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import com.kajol.assistant.data.preferences.KajolPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
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
    private var isInitialized = false

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    init {
        initializeTts()
    }

    fun initializeTts() {
        if (tts == null) {
            tts = TextToSpeech(context, this)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.let { engine ->
                // Try Bangladesh Bengali first, then Indian Bengali, then default
                val bnBd = Locale("bn", "BD")
                val bnIn = Locale("bn", "IN")

                val result = engine.setLanguage(bnBd)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    val resultIn = engine.setLanguage(bnIn)
                    if (resultIn == TextToSpeech.LANG_MISSING_DATA || resultIn == TextToSpeech.LANG_NOT_SUPPORTED) {
                        engine.language = Locale.getDefault()
                    }
                }

                // Choose female voice if voice set is accessible
                try {
                    val voices = engine.voices
                    if (!voices.isNullOrEmpty()) {
                        val femaleVoice = voices.find { voice ->
                            val name = voice.name.lowercase()
                            (voice.locale.language == "bn" || voice.locale == bnBd || voice.locale == bnIn) &&
                                    (name.contains("female") || name.contains("girl") || name.contains("sweet") || name.contains("#female"))
                        } ?: voices.find { it.locale.language == "bn" }
                        if (femaleVoice != null) {
                            engine.voice = femaleVoice
                        }
                    }
                } catch (e: Exception) {
                    // Fallback to default voice
                }

                // Apply initial sweet, soft female tuning
                scope.launch {
                    val pitch = preferences.voicePitchFlow.first()
                    val rate = preferences.voiceRateFlow.first()
                    engine.setPitch(pitch)
                    engine.setSpeechRate(rate)
                }

                engine.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        _isSpeaking.value = true
                    }

                    override fun onDone(utteranceId: String?) {
                        _isSpeaking.value = false
                    }

                    override fun onError(utteranceId: String?) {
                        _isSpeaking.value = false
                    }
                })

                isInitialized = true
            }
        }
    }

    fun speak(text: String, onComplete: (() -> Unit)? = null) {
        if (text.isBlank()) return

        scope.launch {
            val pitch = preferences.voicePitchFlow.first()
            val rate = preferences.voiceRateFlow.first()

            tts?.let { engine ->
                engine.setPitch(pitch)
                engine.setSpeechRate(rate)

                val utteranceId = UUID.randomUUID().toString()
                val params = Bundle().apply {
                    putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
                }

                if (onComplete != null) {
                    engine.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(id: String?) {
                            _isSpeaking.value = true
                        }

                        override fun onDone(id: String?) {
                            if (id == utteranceId) {
                                _isSpeaking.value = false
                                onComplete()
                            }
                        }

                        override fun onError(id: String?) {
                            if (id == utteranceId) {
                                _isSpeaking.value = false
                                onComplete()
                            }
                        }
                    })
                }

                engine.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
            }
        }
    }

    fun stop() {
        tts?.stop()
        _isSpeaking.value = false
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isInitialized = false
    }
}
