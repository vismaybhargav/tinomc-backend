import { Hono } from 'hono'                     // ultra‑light router :contentReference[oaicite:0]{index=0}
import { Rcon } from 'rcon-client'              // modern MC RCON client :contentReference[oaicite:1]{index=1}

const { RCON_HOST, RCON_PORT = '25575', RCON_PASSWORD } = process.env
if (!RCON_HOST || !RCON_PASSWORD) {
	throw new Error('Missing RCON_* env vars')
}

const app = new Hono()

app.post('/api/rcon', async (c) => {
	const { command } = await c.req.json()
	if (typeof command !== 'string') {
		return c.json({ error: '`command` must be a string' }, 400)
	}

	const rcon = await Rcon.connect({
		host: RCON_HOST,
		port: Number(RCON_PORT),
		password: RCON_PASSWORD,
	})
	const reply = await rcon.send(command)
	await rcon.end()

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
