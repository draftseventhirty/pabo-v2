import { Hono } from "hono";

const tipcalc = new Hono();

/** Round to the nearest cent. */
function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** Parse a value as a finite number, or return undefined. */
function toFiniteNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function calcTip(subtotal: number, tipPercentage: number) {
  const roundedSubtotal = round2(subtotal);
  const completeTip = round2(roundedSubtotal * (tipPercentage / 100));
  const totalCost = round2(roundedSubtotal + completeTip);
  return { completeTip, totalCost };
}

tipcalc.get("/", (c) => {
  const subtotalPR = toFiniteNumber(c.req.query("subtotal"));
  const tipPercentagePR = toFiniteNumber(c.req.query("tip"));

  const { completeTip, totalCost } =
    subtotalPR !== undefined && tipPercentagePR !== undefined
      ? calcTip(subtotalPR, tipPercentagePR)
      : { completeTip: undefined, totalCost: undefined };

  return c.render(
    <main>
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
          <p>tip: {completeTip}</p>
          <p>total: {totalCost}</p>
        </div>
      )}
    </main>,
    { pageTitle: "tip calculator" },
  );
});

tipcalc.post("/trigger", async (c) => {
  const form = await c.req.parseBody();
  const subtotal = toFiniteNumber(form["subtotalPR"]);
  const tip = toFiniteNumber(form["tipPercentagePR"]);

  if (subtotal === undefined || tip === undefined) {
    return c.redirect("/tipcalc");
  }

  return c.redirect(
    `/tipcalc?subtotal=${encodeURIComponent(subtotal)}&tip=${encodeURIComponent(tip)}`,
  );
});

export default tipcalc;
