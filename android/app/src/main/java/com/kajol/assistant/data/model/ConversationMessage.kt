package com.kajol.assistant.data.model

import java.util.UUID

data class ConversationMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isFromUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val intentDescription: String? = null,
    val executedActionSuccess: Boolean? = null
)
