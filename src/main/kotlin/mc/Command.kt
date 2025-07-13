package org.vismayb.mc

import kotlinx.serialization.Serializable

@Serializable
data class Command(
    val content: String
)
