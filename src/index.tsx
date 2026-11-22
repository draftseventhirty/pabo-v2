import { Hono } from "hono";
import { renderer } from "./renderer";
import tipcalc from "./routes/tipcalc";
import qr from "./routes/qr";
import weather from "./routes/weather";
import news from "./routes/news";

const app = new Hono();

const pageTitle = "pabo | dumbphone utilities";

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <main>
      <strong>
        <i>V2: now with NO client-side JS!</i>
      </strong>
      <br />
      <br />
      <a href="/tipcalc">tip calculator</a>
      <br />
      <a href="/qr">QR code generator</a>
      <br />
      <a href="/weather">weather</a>
      <br />
      <a href="/news">news renderer</a>
    </main>,
    { pageTitle },
  );
});

app.route("/tipcalc", tipcalc);
app.route("/qr", qr);
app.route("/weather", weather);
app.route("/news", news);

export default app;
