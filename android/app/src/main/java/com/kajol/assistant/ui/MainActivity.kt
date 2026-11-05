package com.kajol.assistant.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kajol.assistant.service.KajolVoiceService
import com.kajol.assistant.ui.screens.CommandsScreen
import com.kajol.assistant.ui.screens.HistoryScreen
import com.kajol.assistant.ui.screens.HomeScreen
import com.kajol.assistant.ui.screens.PermissionsScreen
import com.kajol.assistant.ui.screens.SettingsScreen
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.DarkNavyCard
import com.kajol.assistant.ui.theme.KajolAssistantTheme
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TextMuted
import com.kajol.assistant.ui.theme.TextPrimary
import com.kajol.assistant.ui.viewmodel.MainViewModel
import com.kajol.assistant.ui.viewmodel.ScreenTab
import dagger.hilt.android.AndroidEntryPoint

data class NavTabItem(
    val tab: ScreenTab,
    val title: String,
    val icon: ImageVector
)

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Start background foreground service if enabled
        KajolVoiceService.start(this)

        setContent {
            KajolAssistantTheme {
                MainAppScaffold(viewModel = viewModel)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Re-check permissions on resume
        viewModel.checkPermissions()
    }
}

@Composable
fun MainAppScaffold(viewModel: MainViewModel) {
    val currentTab by viewModel.currentTab.collectAsState()

    val navItems = listOf(
        NavTabItem(ScreenTab.HOME, "হোম", Icons.Default.Home),
        NavTabItem(ScreenTab.COMMANDS, "কমান্ড", Icons.Default.Chat),
        NavTabItem(ScreenTab.PERMISSIONS, "পারমিশন", Icons.Default.Security),
        NavTabItem(ScreenTab.SETTINGS, "সেটিংস", Icons.Default.Settings),
        NavTabItem(ScreenTab.HISTORY, "হিস্ট্রি", Icons.Default.History)
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = DarkNavyCard,
                tonalElevation = 8.dp
            ) {
                navItems.forEach { item ->
                    val isSelected = currentTab == item.tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.currentTab.value = item.tab },
                        icon = {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.title,
                                tint = if (isSelected) TealAccent else TextMuted
                            )
                        },
                        label = {
                            Text(
                                text = item.title,
                                color = if (isSelected) TealAccent else TextMuted,
                                fontSize = 11.sp
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = DarkNavy
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkNavy)
                .padding(innerPadding)
        ) {
            when (currentTab) {
                ScreenTab.HOME -> HomeScreen(viewModel = viewModel)
                ScreenTab.COMMANDS -> CommandsScreen(viewModel = viewModel)
                ScreenTab.PERMISSIONS -> PermissionsScreen(viewModel = viewModel)
                ScreenTab.SETTINGS -> SettingsScreen(viewModel = viewModel)
                ScreenTab.HISTORY -> HistoryScreen(viewModel = viewModel)
            }
        }
    }
}
