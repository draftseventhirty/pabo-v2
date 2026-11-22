import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: "worker" } }), ssrPlugin()],
  optimizeDeps: {
    exclude: ["linkedom"],
  },
  environments: {
    "worker": {
      optimizeDeps: {
        exclude: ["linkedom"],
      },
    },
  },
});
