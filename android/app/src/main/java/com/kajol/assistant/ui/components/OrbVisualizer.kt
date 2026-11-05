package com.kajol.assistant.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.kajol.assistant.data.model.AssistantState
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TealGlow

@Composable
fun OrbVisualizer(
    state: AssistantState,
    modifier: Modifier = Modifier,
    size: Dp = 180.dp,
    audioLevel: Float = 0f
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orbTransition")

    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    val waveAlpha by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 0.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "waveAlpha"
    )

    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 6000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        // Outer animated glowing ripples
        Canvas(modifier = Modifier.size(size)) {
            val center = Offset(this.size.width / 2f, this.size.height / 2f)
            val radius = this.size.minDimension / 2.2f

            when (state) {
                AssistantState.LISTENING -> {
                    val boost = (audioLevel.coerceIn(0f, 10f) * 6f)
                    drawCircle(
                        color = TealGlow.copy(alpha = waveAlpha),
                        radius = (radius * pulseScale) + boost,
                        center = center
                    )
                    drawCircle(
                        color = TealAccent.copy(alpha = 0.25f),
                        radius = radius * 1.05f + (boost / 2),
                        center = center,
                        style = Stroke(width = 4f)
                    )
                }
                AssistantState.THINKING -> {
                    drawCircle(
                        brush = Brush.sweepGradient(
                            listOf(TealAccent, Color(0xFF63B3ED), Color.Transparent, TealAccent)
                        ),
                        radius = radius * 1.1f,
                        center = center,
                        style = Stroke(width = 6f)
                    )
                }
                AssistantState.SPEAKING -> {
                    drawCircle(
                        color = TealAccent.copy(alpha = 0.35f),
                        radius = radius * pulseScale,
                        center = center
                    )
                    drawCircle(
                        color = Color(0xFF81E6D9),
                        radius = radius * 0.95f,
                        center = center,
                        style = Stroke(width = 5f)
                    )
                }
                AssistantState.IDLE, AssistantState.ERROR -> {
                    drawCircle(
                        color = TealGlow.copy(alpha = 0.15f),
                        radius = radius * 1.02f,
                        center = center
                    )
                }
            }
        }

        // Inner core Orb
        val coreModifier = when (state) {
            AssistantState.THINKING -> Modifier.rotate(rotation)
            else -> Modifier
        }

        Box(
            modifier = Modifier
                .size(size * 0.62f)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            TealAccent,
                            Color(0xFF319795),
                            DarkNavy
                        )
                    )
                )
                .then(coreModifier)
        )
    }
}
