import { Hono } from 'hono'
import { Rcon, Game } from 'rcon-node'
import { cors } from 'hono/cors';
const { RCON_HOST, RCON_PASSWORD } = process.env

const RCON_PORT = process.env.RCON_PORT ? Number(process.env.RCON_PORT) : 25575;

if (!RCON_HOST || !RCON_PASSWORD) {
  throw new Error('Missing RCON_* env vars')
}

const app = new Hono()

app.use("*", cors({
  origin: process.env.NODE_ENV === "dev" ? 'http://localhost:3000' : "http://vercel.com",       // or '*' for public APIs
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.get('/api', async (c) => {
  return c.text("OK");
})

app.post('/api/rcon', async (c) => {
  const { command } = await c.req.json()
  if (typeof command !== 'string') {
    return c.json({ error: '`command` must be a string' }, 400)
  }

  const rconConnection = await Rcon.connect({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD,
    game: Game.MINECRAFT,
  })

  const reply = await rconConnection.send(command)

  rconConnection.end();

  return c.json({ ok: true, reply })
})

/**
 * Bun sees this default export and starts listening automatically.
 * You can hard‑code the port here or keep it in an env variable.
 */
export default {
  port: 3000,
  fetch: app.fetch,
}
