import { Hono } from "hono";

const tipcalc = new Hono();

function calcTip(subtotalPR: number, tipPercentagePR: number) {
  const tipPercentage = Math.round((tipPercentagePR * 100) / 100) / 100;
  const subtotal = Math.round(subtotalPR * 100) / 100;
  const completeTip = Math.round(subtotal * tipPercentage * 100) / 100;
  const totalCost = completeTip + subtotal;
  return { completeTip, totalCost };
}

tipcalc.get("/", (c) => {
  const subtotalRaw = c.req.query("subtotal");
  const tipRaw = c.req.query("tip");

  const subtotalPR = Number(subtotalRaw);
  const tipPercentagePR = Number(tipRaw);
  const hasResult =
    subtotalRaw !== undefined &&
    tipRaw !== undefined &&
    Number.isFinite(subtotalPR) &&
    Number.isFinite(tipPercentagePR);

  const { completeTip, totalCost } = hasResult
    ? calcTip(subtotalPR, tipPercentagePR)
    : { completeTip: undefined, totalCost: undefined };

  return c.render(
    <div>
      <form method="post" action="/tipcalc/trigger">
        <input type="text" placeholder="enter subtotal" name="subtotalPR" />
        <input
          type="text"
          placeholder="enter tip percentage"
          name="tipPercentagePR"
        />
        <button>calculate</button>
      </form>
      {completeTip !== undefined && totalCost !== undefined && (
        <div id="totals">
          <p>tip: ${completeTip}</p>
          <p>total: ${totalCost}</p>
        </div>
      )}
    </div>,
    { pageTitle: "tip calculator" },
  );
});

tipcalc.post("/trigger", async (c) => {
  const form = await c.req.parseBody();
  const subtotal = Number(form["subtotalPR"]);
  const tip = Number(form["tipPercentagePR"]);

  if (!Number.isFinite(subtotal) || !Number.isFinite(tip)) {
    return c.redirect("/tipcalc");
  }

  return c.redirect(
    `/tipcalc?subtotal=${encodeURIComponent(subtotal)}&tip=${encodeURIComponent(tip)}`,
  );
});

export default tipcalc;
