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
  const articleDateTime = articleDateDT.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return c.render(
    <main>
      <article>
        <header>
          {articleAuthor} - {articleDateTime}
        </header>
        <br />
        {raw(articleContent)}
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
