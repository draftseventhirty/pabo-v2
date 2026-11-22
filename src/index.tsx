import { Hono } from "hono";
import { renderer } from "./renderer";
import tipcalc from "./routes/tipcalc";
import qr from "./routes/qr";
import weather from "./routes/weather";

const app = new Hono();

const pageTitle = "pabo | dumbphone utilities";

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <div>
      <h3>
        <i>V2: now with NO client-side JS!</i>
      </h3>
      <a href="/tipcalc">tip calculator</a>
      <br />
      <a href="/qr">QR code generator</a>
      <br />
      <a href="/weather">weather</a>
    </div>,
    { pageTitle },
  );
});

app.route("/tipcalc", tipcalc);
app.route("/qr", qr);
app.route("/weather", weather);

export default app;
