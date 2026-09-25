import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { boneyardPlugin } from "boneyard-js/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss(), boneyardPlugin()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  optimizeDeps: {
    include: [
      "@mui/icons-material/AssignmentOutlined",
      "@mui/icons-material/EditNoteOutlined",
      "@mui/icons-material/FactCheckOutlined",
      "@mui/icons-material/GraphicEqOutlined",
      "@mui/icons-material/PictureAsPdfOutlined",
      "@mui/icons-material/SensorsOutlined",
    ],
  },
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3000", "/health": "http://localhost:3000" },
  },
})
