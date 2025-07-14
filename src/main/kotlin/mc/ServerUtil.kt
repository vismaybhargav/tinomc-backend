package org.vismayb.mc

import java.io.DataInputStream
import java.io.DataOutputStream
import java.net.Socket
import java.nio.ByteBuffer
import java.nio.ByteOrder

enum class CommandType(i: Int) {
    AUTH(3),
    EXECUTE(2),
}

object ServerUtil {
    private val host = System.getenv("RCON_HOST") ?: "minecraft"
    private val port = System.getenv("RCON_PORT")?.toIntOrNull() ?: 25575
    private val password = System.getenv("RCON_PASSWORD") ?: error("Set RCON_PASSWORD environment variable")

    fun sendCommand(command: Command): String {
        Socket(host, port).use { socket ->
            DataOutputStream(socket.outputStream).use { out ->
                DataInputStream(socket.inputStream).use { input ->

                    fun sendPacket(type: CommandType, payload: String) {
                        val body = payload.toByteArray(Charsets.UTF_8)
                        val length = 4 /*id*/ + 4 /*type*/ + body.size + 2 /*null terminator*/
                        val packet = ByteBuffer
                            .allocate(length + 4 /*length*/)
                            .order(ByteOrder.LITTLE_ENDIAN)
                            .putInt(length)
                            .putInt(0)
                            .putInt(type.ordinal)
                    }
                }
            }
        }
        return ""
    }
}