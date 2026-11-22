import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin()],
  optimizeDeps: {
    exclude: ["linkedom"],
  },
  environments: {
    // Match your worker environment name if customized (default is usually 'worker' or your worker name)
    worker: {
      optimizeDeps: {
        exclude: ["linkedom"],
      },
    },
  },
});
