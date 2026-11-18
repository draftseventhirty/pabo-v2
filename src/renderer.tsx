import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: { pageTitle?: string },
    ): Response | Promise<Response>;
  }
}

export const renderer = jsxRenderer(({ children, pageTitle = "pabo" }) => {
  return (
    <html>
      <head>
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <title>{pageTitle}</title>
      </head>
      <body>
        <h1>{pageTitle}</h1>
        {children}
        <footer>
          <br />
          <a href="/">home</a>
        </footer>
      </body>
    </html>
  );
});
