import { Hono } from "hono";

const weather = new Hono();

async function getWeather(lat: string, lon: string) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&hourly=temperature_2m,apparent_temperature,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();

  // 3. Find the current time at the location
  //    (the API tells us how many seconds to add to UTC)
  const nowLocal = new Date(Date.now() + data.utc_offset_seconds * 1000)
    .toISOString()
    .slice(0, 16);

  // 4. Build the whole forecast as one text variable
  let forecast = "";

  // Current weather
  forecast += "=== Current ===\n";
  forecast += "Time: " + data.current.time + "\n";
  forecast +=
    "Temp: " +
    data.current.temperature_2m +
    data.current_units.temperature_2m +
    "\n";

  // Daily forecast (one line per day)
  forecast += "\n=== Daily ===\n";
  for (let i = 0; i < data.daily.time.length; i++) {
    const day = data.daily.time[i].slice(5); // "2024-06-01" becomes "06-01"
    const high =
      data.daily.temperature_2m_max[i] + data.daily_units.temperature_2m_max;
    const low =
      data.daily.temperature_2m_min[i] + data.daily_units.temperature_2m_min;
    const rain =
      data.daily.precipitation_sum[i] + data.daily_units.precipitation_sum;

    forecast +=
      day + ": high: " + high + ", low: " + low + ", precip: " + rain + ".\n";
  }

  // Hourly forecast (next 24 hours)
  forecast += "\n=== Next 24 hours ===\n";
  let hoursShown = 0;
  for (let i = 0; i < data.hourly.time.length && hoursShown < 24; i++) {
    // Skip any hours that have already passed
    if (data.hourly.time[i] < nowLocal) {
      continue;
    }

    const hour = data.hourly.time[i].slice(11); // "2024-06-01T14:00" becomes "14:00"
    const temp =
      data.hourly.temperature_2m[i] + data.hourly_units.temperature_2m;
    const feels =
      data.hourly.apparent_temperature[i] +
      data.hourly_units.apparent_temperature;
    const chance = data.hourly.precipitation_probability[i];

    forecast +=
      hour +
      ": " +
      temp +
      ", feels like: " +
      feels +
      ", precip chance: " +
      chance +
      "%.\n";
    hoursShown++;
  }

  return forecast;
}

weather.get("/", async (c) => {
  const lat = (c.req.query("lat") ?? "").trim();
  const lon = (c.req.query("lon") ?? "").trim();

  let readout: string | null = null;
  if (lat && lon) {
    try {
      readout = await getWeather(lat, lon);
    } catch {
      readout = "could not fetch forecast for those coordinates.";
    }
  }

  return c.render(
    <main>
      <form method="post" action="/weather/trigger">
        <input
          type="text"
          name="lat"
          value={lat}
          placeholder="latitude (12.34)"
        />
        <input
          type="text"
          name="lon"
          value={lon}
          placeholder="longitude (-56.78)"
        />
        <button>fetch</button>
      </form>
      <pre id="info">{readout ?? ""}</pre>
    </main>,
    { pageTitle: "weather" },
  );
});

weather.post("/trigger", async (c) => {
  const form = await c.req.parseBody();
  const lat = String(form["lat"] ?? "").trim();
  const lon = String(form["lon"] ?? "").trim();

  if (!(lat && lon)) {
    return c.redirect("/weather");
  }

  return c.redirect(
    `/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
  );
});

export default weather;
