package com.kajol.assistant.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.DarkNavyCard
import com.kajol.assistant.ui.theme.DarkNavySurface
import com.kajol.assistant.ui.theme.StatusGreen
import com.kajol.assistant.ui.theme.StatusRed
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TextMuted
import com.kajol.assistant.ui.theme.TextPrimary
import com.kajol.assistant.ui.theme.TextSecondary
import com.kajol.assistant.ui.viewmodel.MainViewModel
import com.kajol.assistant.ui.viewmodel.PermissionItem

@Composable
fun PermissionsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val permissions by viewModel.permissionList.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "অনুমতি ও এক্সেস কন্ট্রোল",
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "নির্ভুল ভয়েস সেবার জন্য প্রয়োজনীয় পারমিশনসমূহ",
                    color = TextSecondary,
                    fontSize = 13.sp
                )
            }
            IconButton(onClick = { viewModel.checkPermissions() }) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "রিফ্রেশ করুন",
                    tint = TealAccent
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            // OEM Battery Warning Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkNavySurface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "💡 গুরুত্বপূর্ণ: Xiaomi / Samsung / Oppo ব্যবহারকারী",
                            color = TealAccent,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "ব্যাকগ্রাউন্ডে সবসময় শুনতে পাওয়ার জন্য ফোনের সেটিংস থেকে Kajol অ্যাপের 'Auto-start' (অটো-স্টার্ট) চালু করুন এবং ব্যাটারি অপ্টিমাইজেশন 'No restrictions' বা 'Unrestricted' নির্বাচন করুন।",
                            color = TextSecondary,
                            fontSize = 12.sp,
                            lineHeight = 17.sp
                        )
                    }
                }
            }

            items(permissions) { item ->
                PermissionCard(
                    item = item,
                    onOpenSettings = { openExactPermissionSettings(context, item.id) }
                )
            }
        }
    }
}

@Composable
fun PermissionCard(
    item: PermissionItem,
    onOpenSettings: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.title,
                    color = TextPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            if (item.isGranted) StatusGreen.copy(alpha = 0.2f)
                            else StatusRed.copy(alpha = 0.2f)
                        )
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (item.isGranted) Icons.Default.Check else Icons.Default.Close,
                            contentDescription = null,
                            tint = if (item.isGranted) StatusGreen else StatusRed,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (item.isGranted) "অনুমোদিত" else "অনুপস্থিত",
                            color = if (item.isGranted) StatusGreen else StatusRed,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = item.bengaliDescription,
                color = TextSecondary,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )

            if (!item.isGranted) {
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedButton(
                    onClick = onOpenSettings,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "অনুমতি দিন (সেটিংস ওপেন করুন)",
                        color = TealAccent,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

fun openExactPermissionSettings(context: Context, permissionId: String) {
    try {
        when (permissionId) {
            "SYSTEM_ALERT_WINDOW" -> {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                context.startActivity(intent)
            }
            "IGNORE_BATTERY_OPTIMIZATION" -> {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${context.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
            }
            "POST_NOTIFICATIONS" -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                } else {
                    openAppDetailsSettings(context)
                }
            }
            else -> {
                openAppDetailsSettings(context)
            }
        }
    } catch (e: Exception) {
        openAppDetailsSettings(context)
    }
}

fun openAppDetailsSettings(context: Context) {
    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
        data = Uri.fromParts("package", context.packageName, null)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
}
