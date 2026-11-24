import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { PACKAGE, resolveBase } from "../../tools/bases.mjs"

export const DP_BASE = resolveBase(process.env.DP_BASE)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.join(PACKAGE, "registry", DP_BASE) },
  },
})
