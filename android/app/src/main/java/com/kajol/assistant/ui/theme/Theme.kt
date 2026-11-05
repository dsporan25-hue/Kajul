package com.kajol.assistant.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = TealAccent,
    onPrimary = DarkNavy,
    primaryContainer = TealDark,
    onPrimaryContainer = TextPrimary,
    secondary = TealAccent,
    background = DarkNavy,
    onBackground = TextPrimary,
    surface = DarkNavyCard,
    onSurface = TextPrimary,
    surfaceVariant = DarkNavySurface,
    onSurfaceVariant = TextSecondary
)

@Composable
fun KajolAssistantTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
