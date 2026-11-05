package com.kajol.assistant.service

import android.annotation.SuppressLint
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import com.kajol.assistant.R
import com.kajol.assistant.data.model.AssistantState
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class KajolOverlayService : Service() {

    @Inject lateinit var ttsManager: BengaliTtsManager
    @Inject lateinit var speechRecognizer: BengaliSpeechRecognizer

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var params: WindowManager.LayoutParams? = null

    private val _orbState = MutableStateFlow(AssistantState.IDLE)
    val orbState = _orbState.asStateFlow()

    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createFloatingOrb()
        observeTtsAndSpeech()
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun createFloatingOrb() {
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 40
            y = 300
        }

        val frame = FrameLayout(this)
        val orbIcon = ImageView(this).apply {
            setImageResource(android.R.drawable.ic_btn_speak_now)
            setBackgroundColor(0xFF0B1020.toInt())
            setPadding(28, 28, 28, 28)
            elevation = 16f
        }
        frame.addView(orbIcon)
        overlayView = frame

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isClick = false

        frame.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params?.x ?: 0
                    initialY = params?.y ?: 0
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isClick = true
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (event.rawX - initialTouchX).toInt()
                    val dy = (event.rawY - initialTouchY).toInt()
                    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                        isClick = false
                    }
                    params?.x = initialX + dx
                    params?.y = initialY + dy
                    windowManager?.updateViewLayout(overlayView, params)
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (isClick) {
                        onOrbClicked()
                    }
                    true
                }
                else -> false
            }
        }

        try {
            windowManager?.addView(overlayView, params)
        } catch (e: Exception) {
            // Permission might have been revoked
        }
    }

    private fun onOrbClicked() {
        val triggerIntent = Intent(this, KajolVoiceService::class.java).apply {
            action = KajolVoiceService.ACTION_TRIGGER_LISTENING
        }
        startService(triggerIntent)
    }

    private fun observeTtsAndSpeech() {
        serviceScope.launch {
            ttsManager.isSpeaking.collect { isSpeaking ->
                if (isSpeaking) {
                    _orbState.value = AssistantState.SPEAKING
                } else {
                    _orbState.value = AssistantState.IDLE
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
