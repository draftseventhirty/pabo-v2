import { Hono } from "hono";

const qr = new Hono();

async function genQR(inputURL: string): Promise<string> {
  const res = await fetch("https://theqrcode.io/api/public/qr-codes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "url",
      content: inputURL,
    }),
  });
  const data = (await res.json()) as { qrImage: string };
  return data.qrImage;
}

qr.get("/", async (c) => {
  const inputURL = c.req.query("url") ?? "";
  let qrImage = "";
  if (inputURL) {
    qrImage = await genQR(inputURL);
  }

  return c.render(
    <main>
      <form method="post" action="/qr/trigger">
        <input type="text" placeholder="enter URL" name="inputURL" />
        <button>generate</button>
        <br />
        {qrImage && <img name="qrFrame" src={qrImage} />}
        {inputURL && <p>{inputURL}</p>}
      </form>
    </main>,
    { pageTitle: "QR code generator" },
  );
});

qr.post("/trigger", async (c) => {
  const form = await c.req.parseBody();
  const inputURL = String(form["inputURL"] ?? "").trim();

  if (!inputURL) {
    return c.redirect("/qr");
  }

  return c.redirect(`/qr?url=${encodeURIComponent(inputURL)}`);
});

export default qr;
