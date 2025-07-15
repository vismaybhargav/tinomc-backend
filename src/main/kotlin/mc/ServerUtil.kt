package org.vismayb.mc

import java.io.DataInputStream
import java.io.DataOutputStream
import java.net.Socket
import java.nio.ByteBuffer
import java.nio.ByteOrder

object ServerUtil {
    const val CMD_AUTH = 2
    const val CMD_EXECUTE = 3
    private val host = System.getenv("RCON_HOST") ?: error("Set RCON_HOST environment variable")
    private val port = System.getenv("RCON_PORT")?.toIntOrNull() ?: error("SET RCON_PORT environment variable")
    private val password = System.getenv("RCON_PASSWORD") ?: error("Set RCON_PASSWORD environment variable")

    fun sendCommand(command: Command): String {
        Socket(host, port).use { socket ->
            DataOutputStream(socket.outputStream).use { out ->
                DataInputStream(socket.inputStream).use { input ->
                    fun sendPacket(type: Int, payload: String) {
                        val body = payload.toByteArray(Charsets.UTF_8)
                        val length = 4 /*id*/ + 4 /*type*/ + body.size + 2 /*null terminator*/
                        val packet = ByteBuffer
                            .allocate(length + 4 /*length*/)
                            .order(ByteOrder.LITTLE_ENDIAN)
                            .putInt(length) // packet size
                            .putInt(0) // request id (unused)
                            .putInt(type) // packet type
                            .put(body)
                            .put(0.toByte())
                            .put(0.toByte())
                            .array()

                        out.write(packet)
                        out.flush()
                    }

                    fun recieveResponse(): String {
                        val bytesLen = ByteArray(4)
                        input.readFully(bytesLen)
                        val length = ByteBuffer
                            .wrap(bytesLen)
                            .order(ByteOrder.LITTLE_ENDIAN)
                            .int

                        // read (id + type + body + 2 null)
                        val data = ByteArray(length)
                        input.readFully(data)
                        val bb = ByteBuffer
                            .wrap(data)
                            .order(ByteOrder.LITTLE_ENDIAN)

                        bb.int // skip request id
                        bb.int // skip type
                        val payloadBytes = ByteArray(length - 8) // body length = total length - (id + type + 2 null terminators)
                        bb.get(payloadBytes)
                        return String(payloadBytes, Charsets.UTF_8).trimEnd('\u0000')
                    }

                    sendPacket(CMD_AUTH, password)
                    val authResponse = recieveResponse()
                    if (authResponse.isEmpty()) {
                        throw IllegalStateException("Authentication failed, check RCON_PASSWORD")
                    }

                    sendPacket(CMD_EXECUTE, command.content)
                    return recieveResponse()
                }
            }
        }
    }
}