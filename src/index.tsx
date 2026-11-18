import { Hono } from "hono";
import { renderer } from "./renderer";
import tipcalc from "./routes/tipcalc";
import qr from "./routes/qr";

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
    </div>,
    { pageTitle },
  );
});

app.route("/tipcalc", tipcalc);
app.route("/qr", qr);

export default app;
