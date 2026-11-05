package com.kajol.assistant.service

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BengaliSpeechRecognizer @Inject constructor(
    @ApplicationContext private val context: Context
) : RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    private var isContinuousListening = false
    private var isListeningActive = false

    private val _recognizedText = MutableStateFlow("")
    val recognizedText: StateFlow<String> = _recognizedText.asStateFlow()

    private val _partialText = MutableStateFlow("")
    val partialText: StateFlow<String> = _partialText.asStateFlow()

    private val _rmsDb = MutableStateFlow(0f)
    val rmsDb: StateFlow<Float> = _rmsDb.asStateFlow()

    var onSpeechResultListener: ((String) -> Unit)? = null
    var onWakeWordDetectedListener: (() -> Unit)? = null

    init {
        mainHandler.post { initRecognizer() }
    }

    private fun initRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer?.destroy()
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(this@BengaliSpeechRecognizer)
            }
        }
    }

    fun startListening(continuous: Boolean = true) {
        mainHandler.post {
            isContinuousListening = continuous
            if (speechRecognizer == null) {
                initRecognizer()
            }

            try {
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "bn-BD")
                    putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "bn-BD")
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                    putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
                }
                speechRecognizer?.startListening(intent)
                isListeningActive = true
            } catch (e: Exception) {
                Log.e("BengaliSpeechRecognizer", "Error starting speech recognition: ${e.message}")
                scheduleRestart()
            }
        }
    }

    fun stopListening() {
        mainHandler.post {
            isContinuousListening = false
            isListeningActive = false
            try {
                speechRecognizer?.stopListening()
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    private fun scheduleRestart() {
        if (!isContinuousListening) return
        mainHandler.postDelayed({
            if (isContinuousListening) {
                startListening(true)
            }
        }, 800)
    }

    override fun onReadyForSpeech(params: Bundle?) {
        isListeningActive = true
    }

    override fun onBeginningOfSpeech() {}

    override fun onRmsChanged(rmsdB: Float) {
        _rmsDb.value = rmsdB
    }

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        isListeningActive = false
    }

    override fun onError(error: Int) {
        isListeningActive = false
        // Error code 7: ERROR_NO_MATCH, code 6: ERROR_SPEECH_TIMEOUT
        // In continuous always-listening mode, restart immediately
        scheduleRestart()
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val bestMatch = matches?.firstOrNull()?.trim() ?: ""

        if (bestMatch.isNotEmpty()) {
            _recognizedText.value = bestMatch
            onSpeechResultListener?.invoke(bestMatch)
        }

        scheduleRestart()
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val partial = matches?.firstOrNull()?.trim() ?: ""
        if (partial.isNotEmpty()) {
            _partialText.value = partial
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}

    fun destroy() {
        mainHandler.post {
            isContinuousListening = false
            speechRecognizer?.destroy()
            speechRecognizer = null
        }
    }
}
