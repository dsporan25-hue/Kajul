package com.kajol.assistant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.DarkNavyCard
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TextMuted
import com.kajol.assistant.ui.theme.TextPrimary
import com.kajol.assistant.ui.theme.TextSecondary
import com.kajol.assistant.ui.viewmodel.MainViewModel

data class CommandCategory(
    val title: String,
    val commands: List<CommandExample>
)

data class CommandExample(
    val bengaliCommand: String,
    val description: String
)

@Composable
fun CommandsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val categories = listOf(
        CommandCategory(
            title = "মাল্টিমিডিয়া ও বিনোদন",
            commands = listOf(
                CommandExample("ইউটিউবে রবীন্দ্রসঙ্গীত বাজাও", "ইউটিউবে নির্দিষ্ট গান সার্চ করে চালু করবে"),
                CommandExample("ফেসবুক খোলো", "সরাসরি ফেসবুক অ্যাপ চালু করবে"),
                CommandExample("ক্যামেরা ওপেন করো", "ছবি তোলার জন্য ক্যামেরা চালু করবে")
            )
        ),
        CommandCategory(
            title = "কল ও মেসেজিং",
            commands = listOf(
                CommandExample("আম্মুকে ফোন করো", "পরিচিতি তালিকা থেকে নাম খুঁজে ডায়াল করবে"),
                CommandExample("০১৭XXXXXXXX এ মেসেজ পাঠাও আমি আসছি", "সরাসরি এসএমএস কম্পোজ করবে")
            )
        ),
        CommandCategory(
            title = "ডিভাইস নিয়ন্ত্রণ",
            commands = listOf(
                CommandExample("ফ্ল্যাশলাইট জ্বালাও", "ফোনের পেছনের টর্চ অন করবে"),
                CommandExample("ভলিউম বাড়িয়ে দাও", "ফোনের মিডিয়া সাউন্ড বাড়াবে"),
                CommandExample("ওয়াইফাই খোলো", "ওয়াইফাই সেটিংস মেনু আনবে"),
                CommandExample("ডু নট ডিস্টার্ব চালু করো", "বিরক্তিকর শব্দ নীরব রাখবে")
            )
        ),
        CommandCategory(
            title = "সময়, অ্যালার্ম ও সতর্কতা",
            commands = listOf(
                CommandExample("সকাল ৭টায় অ্যালার্ম দাও", "পরবর্তী অ্যালার্ম ঘড়ি সেট করবে"),
                CommandExample("১০ মিনিটের টাইমার সেট করো", "কাউন্টডাউন টাইমার শুরু করবে"),
                CommandExample("কয়টা বাজে", "বর্তমান সময় ও বাংলা তারিখ বলবে")
            )
        ),
        CommandCategory(
            title = "ম্যাপ, আবহাওয়া ও তথ্য",
            commands = listOf(
                CommandExample("আজকের আবহাওয়া কেমন", "বর্তমান তাপমাত্রা ও আবহাওয়ার বার্তা জানাবে"),
                CommandExample("ম্যাপে ধানমন্ডি ৩২ যাওয়ার রাস্তা দেখাও", "গুগল ম্যাপসে নেভিগেশন চালু করবে"),
                CommandExample("বাংলাদেশের জাতীয় ফুল কী", "জেমিনি এআই এর মাধ্যমে সুন্দর বাংলা উত্তর দেবে")
            )
        )
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "ভয়েস কমান্ডের তালিকা",
            color = TextPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = "নিচের যেকোনো বাক্য উচ্চারণ করে কাজলকে নির্দেশ দিতে পারেন",
            color = TextSecondary,
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(categories) { category ->
                Column {
                    Text(
                        text = category.title,
                        color = TealAccent,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    category.commands.forEach { cmd ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clickable { viewModel.processVoiceInput(cmd.bengaliCommand) },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "\"${cmd.bengaliCommand}\"",
                                        color = TextPrimary,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(
                                        text = cmd.description,
                                        color = TextMuted,
                                        fontSize = 12.sp
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(TealAccent.copy(alpha = 0.15f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PlayArrow,
                                        contentDescription = "পরীক্ষা করুন",
                                        tint = TealAccent,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
