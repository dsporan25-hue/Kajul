package com.kajol.assistant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kajol.assistant.ui.theme.DarkNavy
import com.kajol.assistant.ui.theme.DarkNavyCard
import com.kajol.assistant.ui.theme.DarkNavySurface
import com.kajol.assistant.ui.theme.TealAccent
import com.kajol.assistant.ui.theme.TextMuted
import com.kajol.assistant.ui.theme.TextPrimary
import com.kajol.assistant.ui.theme.TextSecondary
import com.kajol.assistant.ui.viewmodel.MainViewModel

@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val wakePhrase by viewModel.wakePhrase.collectAsState()
    val voicePitch by viewModel.voicePitch.collectAsState()
    val voiceRate by viewModel.voiceRate.collectAsState()
    val lockScreenEnabled by viewModel.lockScreenEnabled.collectAsState()
    val alwaysListening by viewModel.alwaysListening.collectAsState()
    val savedApiKey by viewModel.apiKey.collectAsState()

    var wakePhraseInput by remember(wakePhrase) { mutableStateOf(wakePhrase) }
    var apiKeyInput by remember(savedApiKey) { mutableStateOf(savedApiKey) }
    var isKeyVisible by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkNavy)
            .padding(horizontal = 20.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "সেটিংস ও পছন্দসমূহ",
            color = TextPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "কাস্টম ওয়েক-ওয়ার্ড, কণ্ঠের সুর ও জেমিনি এআই এপিআই কি কনফিগার করুন",
            color = TextSecondary,
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
        )

        // Wake Phrase Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "ওয়েক ফ্রেজ (Wake Phrase)",
                    color = TealAccent,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "যে শব্দটি বললে কাজল সাড়া দেবে (ডিফল্ট: \"হ্যালো কাজল\")",
                    color = TextMuted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 2.dp, bottom = 10.dp)
                )

                OutlinedTextField(
                    value = wakePhraseInput,
                    onValueChange = { wakePhraseInput = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("যেমন: হ্যালো কাজল") }
                )

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = { viewModel.setWakePhrase(wakePhraseInput) },
                    colors = ButtonDefaults.buttonColors(containerColor = TealAccent),
                    modifier = Modifier.align(Alignment.End)
                ) {
                    Text(text = "সংরক্ষণ করুন", color = DarkNavy, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Bengali Voice Tuning Card (Pitch & Rate)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "কাজলের মিষ্টি কণ্ঠ সুর (বাংলা TTS)",
                    color = TealAccent,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "কণ্ঠের পিচ ও গতি আপনার পছন্দমতো সমন্বয় করুন",
                    color = TextMuted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                )

                // Pitch Slider
                Text(
                    text = "কণ্ঠের সুরের পিচ (Pitch): ${String.format("%.2f", voicePitch)}x (মিষ্টি নারী কণ্ঠ)",
                    color = TextPrimary,
                    fontSize = 13.sp
                )
                Slider(
                    value = voicePitch,
                    onValueChange = { viewModel.setVoicePitch(it) },
                    valueRange = 0.8f..1.4f,
                    colors = SliderDefaults.colors(
                        thumbColor = TealAccent,
                        activeTrackColor = TealAccent
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Rate Slider
                Text(
                    text = "কথা বলার গতি (Speed): ${String.format("%.2f", voiceRate)}x (স্বাভাবিক মিষ্টি টান)",
                    color = TextPrimary,
                    fontSize = 13.sp
                )
                Slider(
                    value = voiceRate,
                    onValueChange = { viewModel.setVoiceRate(it) },
                    valueRange = 0.7f..1.3f,
                    colors = SliderDefaults.colors(
                        thumbColor = TealAccent,
                        activeTrackColor = TealAccent
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedButton(
                    onClick = { viewModel.testTtsVoice() },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "🔊 কাজলের মিষ্টি কণ্ঠ পরীক্ষা করুন",
                        color = TealAccent,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Background & Lock Screen Toggles
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Always Listening Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "সবসময় শুনবে (Always Listening)",
                            color = TextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "অ্যাপ বন্ধ থাকলেও ব্যাকগ্রাউন্ডে ওয়েক-ওয়ার্ড শুনবে",
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }
                    Switch(
                        checked = alwaysListening,
                        onCheckedChange = { viewModel.setAlwaysListening(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = TealAccent)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Lock Screen Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "লক স্ক্রিনে সাড়া দেবে (Lock Screen)",
                            color = TextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "ফোন লক অবস্থায় স্ক্রিন অন করে কমান্ড সম্পন্ন করবে",
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }
                    Switch(
                        checked = lockScreenEnabled,
                        onCheckedChange = { viewModel.setLockScreenEnabled(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = TealAccent)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Gemini API Key Card (Stored in EncryptedSharedPreferences)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkNavyCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Gemini AI এপিআই কি (API Key)",
                    color = TealAccent,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "সাধারণ জ্ঞান, অনুবাদ ও বুদ্ধিমত্তা উত্তরের জন্য এপিআই কি দিন। এটি EncryptedSharedPreferences-এ নিরাপদভাবে সংরক্ষিত থাকে।",
                    color = TextMuted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 2.dp, bottom = 10.dp)
                )

                OutlinedTextField(
                    value = apiKeyInput,
                    onValueChange = { apiKeyInput = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("AIzaSy...") },
                    visualTransformation = if (isKeyVisible) VisualTransformation.None else PasswordVisualTransformation()
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(onClick = { isKeyVisible = !isKeyVisible }) {
                        Text(
                            text = if (isKeyVisible) "লুকান" else "দেখান",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }

                    Button(
                        onClick = { viewModel.saveApiKey(apiKeyInput) },
                        colors = ButtonDefaults.buttonColors(containerColor = TealAccent)
                    ) {
                        Text(text = "সংরক্ষণ করুন", color = DarkNavy, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))
    }
}
