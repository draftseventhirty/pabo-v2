import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin()],
  optimizeDeps: {
    exclude: ["linkedom"],
  },
  environments: {
    "pabo-v2": {
      optimizeDeps: {
        exclude: ["linkedom"],
      },
    },
  },
});
