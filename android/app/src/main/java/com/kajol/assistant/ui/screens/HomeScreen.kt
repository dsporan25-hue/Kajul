package com.kajol.assistant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.FlashlightOn
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kajol.assistant.data.model.AssistantState
import com.kajol.assistant.ui.components.OrbVisualizer
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.DarkNavyCard
import com.kajol.assistant.ui.theme.DarkNavySurface
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TextMuted
import com.kajol.assistant.ui.theme.TextPrimary
import com.kajol.assistant.ui.theme.TextSecondary
import com.kajol.assistant.ui.viewmodel.MainViewModel

data class QuickActionItem(
    val title: String,
    val commandText: String,
    val icon: ImageVector,
    val accentColor: Color
)

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.assistantState.collectAsState()
    val wakePhrase by viewModel.wakePhrase.collectAsState()

    val quickActions = listOf(
        QuickActionItem("গান বাজাও", "ইউটিউবে গান চালাও", Icons.Default.PlayArrow, Color(0xFFFF4B4B)),
        QuickActionItem("কল করো", "কল করো", Icons.Default.Call, Color(0xFF48BB78)),
        QuickActionItem("ফ্ল্যাশলাইট", "ফ্ল্যাশলাইট জ্বালাও", Icons.Default.FlashlightOn, Color(0xFFECC94B)),
        QuickActionItem("আবহাওয়া", "আজকের আবহাওয়া কেমন", Icons.Default.WbSunny, Color(0xFF4FD1C5)),
        QuickActionItem("অ্যালার্ম", "সকাল ৭টায় অ্যালার্ম দাও", Icons.Default.Alarm, Color(0xFFED8936)),
        QuickActionItem("অ্যাপ খোলো", "ফেসবুক খোলো", Icons.Default.Apps, Color(0xFF9F7AEA))
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Top Status Badge
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(DarkNavySurface)
                .padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            when (state) {
                                AssistantState.LISTENING -> TealAccent
                                AssistantState.THINKING -> Color(0xFFECC94B)
                                AssistantState.SPEAKING -> Color(0xFF48BB78)
                                else -> Color(0xFF38B2AC)
                            }
                        )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = when (state) {
                        AssistantState.LISTENING -> "শুনছি… বলুন"
                        AssistantState.THINKING -> "ভাবছি…"
                        AssistantState.SPEAKING -> "উত্তর দিচ্ছি…"
                        else -> "কাজল সক্রিয় রয়েছে"
                    },
                    color = TextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Floating Animated Orb
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.clickable {
                if (state == AssistantState.LISTENING) {
                    viewModel.stopListening()
                } else {
                    viewModel.startListening()
                }
            }
        ) {
            OrbVisualizer(state = state, size = 190.dp)
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Wake Phrase Hint
        Text(
            text = "\"$wakePhrase\"",
            color = TealAccent,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        Text(
            text = "বললেই আমি সাড়া দেব, স্ক্রিন লক থাকলেও পাশে আছি",
            color = TextSecondary,
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        // Mic Manual Activation Button
        IconButton(
            onClick = {
                if (state == AssistantState.LISTENING) viewModel.stopListening() else viewModel.startListening()
            },
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(TealAccent, Color(0xFF319795))
                    )
                )
        ) {
            Icon(
                imageVector = Icons.Default.Mic,
                contentDescription = "কথা বলুন",
                tint = DarkNavy,
                modifier = Modifier.size(32.dp)
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Quick Command Actions Title
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
        ) {
            Text(
                text = "দ্রুত নির্দেশনাসমূহ",
                color = TextPrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 2x3 Grid of Quick Cards
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            items(quickActions) { item ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.processVoiceInput(item.commandText) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(item.accentColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.title,
                                tint = item.accentColor,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = item.title,
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = item.commandText,
                                color = TextMuted,
                                fontSize = 11.sp,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }
    }
}
