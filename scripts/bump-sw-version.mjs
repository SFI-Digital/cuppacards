import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const swPath = path.join(__dirname, "../public/sw.js")

let content = fs.readFileSync(swPath, "utf-8")
content = content.replace(
  /const CACHE_NAME = "cuppa-v\d+"/,
  `const CACHE_NAME = "cuppa-v${Date.now()}"`
)
fs.writeFileSync(swPath, content)
console.log(`[bump-sw-version] CACHE_NAME updated to cuppa-v${Date.now()}`)
