package org.vismayb

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.request.receive
import io.ktor.server.request.receiveText
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.vismayb.mc.Command
import org.vismayb.mc.ServerUtil

fun Application.configureRouting() {
    routing {
        route("/command") {
            post {
                try {
                    val command = call.receive<Command>()

                    // Process the command here
                    call.respondText("Command received: ${command.content}", ContentType.Text.Plain)
                } catch (e: Exception) {
                    call.respondText("Error processing command: ${e.message}", ContentType.Text.Plain, HttpStatusCode.BadRequest)
                }
            }
        }
    }
}
