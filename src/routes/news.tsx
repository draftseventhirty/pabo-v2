import { Hono } from "hono";
import { html, raw } from "hono/html";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

const news = new Hono();

export default news;

export async function getArticle(url: string) {
  const response = await fetch(url);
  const html = await response.text();

  // parseHTML returns a standard DOM document compatible with Readability
  const { document } = parseHTML(html);
  document
    .querySelectorAll(
      "img, picture, source, svg, video, audio, iframe, object, embed, pre",
    )
    .forEach((el) => el.remove());

  // Optional: set base URL so relative links/images resolve properly
  const base = document.createElement("base");
  base.href = url;
  document.head.appendChild(base);

  const reader = new Readability(document);
  return reader.parse();
}

news.get("/", (c) => {
  const articleContent = c.req.query("article");
  return c.render(
    <div>
      <form method="post" action="/news/reader">
        <input type="text" name="url"></input>
        <button>fetch</button>
      </form>
      {/*<article id="info">{articleContent ?? "article content appears here..."}</article>*/}
    </div>,
    { pageTitle: "news" },
  );
});

news.post("/reader", async (c) => {
  const form = await c.req.parseBody();
  const url = String(form["url"] ?? "").trim();
  const article = await getArticle(url);
  const articleContent = article?.content ?? "article fetch failed";
  const articleTitle = article?.title ?? "(no title)";
  const articleAuthor = article?.byline ?? "Unknown Author";
  const articleIsoDT = article?.publishedTime ?? "";
  const articleDateDT = new Date(articleIsoDT);
  const articleDateTime = articleDateDT.toLocaleString("sv-SE", { // sv-SE to get iso-8601
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) + " UTC";

  c.header("Content-Security-Policy", "script-src 'none'");

  return c.render(
    <main>
      <article>
        <header>
          {articleAuthor}
          <br />
          {articleDateTime}
        </header>
        <br />
        <section>
          {raw(articleContent)}
        </section>
      </article>
      <br />
      <a href={url}>original article</a>
      <br />
      <br />
      <a href="/news">back to news homepage</a>
    </main>,
    { pageTitle: articleTitle },
  );
});
