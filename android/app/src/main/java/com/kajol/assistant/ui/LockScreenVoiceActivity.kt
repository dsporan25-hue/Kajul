package com.kajol.assistant.ui

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kajol.assistant.data.model.AssistantState
import com.kajol.assistant.ui.components.OrbVisualizer
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.DarkNavyCard
import com.kajol.assistant.ui.theme.KajolAssistantTheme
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TextPrimary
import com.kajol.assistant.ui.theme.TextSecondary
import com.kajol.assistant.ui.viewmodel.MainViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LockScreenVoiceActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        unlockAndTurnScreenOn()

        setContent {
            KajolAssistantTheme {
                LockScreenOverlayContent(
                    viewModel = viewModel,
                    onDismiss = { finish() }
                )
            }
        }
    }

    private fun unlockAndTurnScreenOn() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            keyguardManager?.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }
    }
}

@Composable
fun LockScreenOverlayContent(
    viewModel: MainViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.assistantState.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val lastMessage = messages.lastOrNull()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xAA0B1020))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                OrbVisualizer(state = state, size = 140.dp)

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "কাজল লক-স্ক্রিন মোড",
                    color = TealAccent,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = when (state) {
                        AssistantState.LISTENING -> "শুনছি... আপনার কমান্ড দিন"
                        AssistantState.THINKING -> "প্রক্রিয়াকরণ করছি..."
                        AssistantState.SPEAKING -> "উত্তর দিচ্ছি..."
                        else -> "বলুন..."
                    },
                    color = TextPrimary,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )

                if (lastMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = lastMessage.text,
                        color = TextSecondary,
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}
