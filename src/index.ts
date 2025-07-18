import { Hono } from 'hono'
import { Rcon, Game } from 'rcon-node'
import { cors } from 'hono/cors';
import path from 'path'
import { spawn } from 'bun';
const { RCON_HOST, RCON_PASSWORD, RCON_PORT, HOST_IP } = process.env

if (!RCON_HOST || !RCON_PASSWORD || !RCON_PORT || !HOST_IP) {
  throw new Error('Ensure all environment variables are set: RCON_HOST, RCON_PASSWORD, RCON_PORT, HOST_IP');
}

const app = new Hono();

const rconConnection = await Rcon.connect({
  host: RCON_HOST,
  port: RCON_PORT ? parseInt(RCON_PORT) : 25575,
  password: RCON_PASSWORD,
  game: Game.MINECRAFT,
});

app.use("*", cors({
  origin: "*",// process.env.NODE_ENV === "dev" ? 'http://localhost:3000' : "http://vercel.com",       // or '*' for public APIs
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/api', (c) => {
  return c.text("STATUS: OK");
});

app.get('api/server-status', async (c) => {
  const ac = new AbortController();

  const res = await fetch(`http://${HOST_IP}`, {
    method: "HEAD",
    cache: "no-cache",
    signal: ac.signal
  });

  res.ok ? c.json({ status: "online" }) : c.json({ status: "offline" });
});

app.post('/api/rcon', async (c) => {
  const { command } = await c.req.json();

  if (typeof command !== 'string') {
    return c.json({ error: '`command` must be a string' }, 400);
  }

  const reply = await rconConnection.send(command);

  return c.json({ ok: true, reply });
});

app.get('/api/mods', (c) => {
  const modsDir = path.resolve('C:', 'Users', 'Administrator', 'AppData', 'Roaming', '.minecraft', 'mods');
  const tar = spawn({
      cmd: ['tar', '-C', modsDir, '-czf', '-', '.'],
      stdout: 'pipe',
      stderr: 'inherit', 
    }
  );

  const headers = new Headers({
    'Content-Type': 'application/gzip',
    'Content-Disposition': 'attachment; filename="mods.tar.gz"',
  });

  return new Response(tar.stdout, { status: 200, headers });
});


process.on("exit", (code) => {
  rconConnection.end();
})

/**
 * Bun sees this default export and starts listening automatically.
 * You can hard‑code the port here or keep it in an env variable.
 */
export default {
  port: 3000,
  fetch: app.fetch,
}
