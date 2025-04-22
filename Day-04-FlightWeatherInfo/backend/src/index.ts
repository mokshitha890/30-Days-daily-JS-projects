import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getFlightNumLocDt } from './weather.js'
import { cors } from 'hono/cors'
import { config } from 'dotenv';

config(); // Load .env
const app = new Hono()



app.use('*', cors({
  origin: 'http://127.0.0.1:5500',
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))


app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.get('/weather/:loc', (c) => {
  const hour = c.req.query('hour')
  const loc = c.req.param('loc')
  return c.json({ temp: 20, condition: 'Sunny', loc: loc, hour: hour })
})

app.get('/flight/:flightNumber', async (c) => {
  const flightNumber = c.req.param("flightNumber")

})

app.get('/result', async (c) => {

  const date = c.req.query('date')
  const flightNumber = c.req.query('flightNumber')
  const location = c.req.query('location')
  const result = await getFlightNumLocDt(flightNumber, location, date)
  return c.json(result)
})

app.post('/aiText', async (c) => {

  const body = await c.req.json()
  console.log(body)
  return c.json({ text: body })
})


// Serve app on local network
const PORT = 3000;
const HOST = '0.0.0.0'; // This binds to all network interfaces

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: HOST,
});

console.log(`✅ Server running at http://localhost:${PORT}`);
console.log(`🌐 Also accessible from your local network (e.g. http://192.168.X.X:${PORT})`);

// serve({
//   fetch: app.fetch,
//   port: 3000,
//   hostname: "0.0.0.0"
// }, (info) => {
//   console.log(`Server is running on http://localhost:${info.port}`)
// })

