import { Command } from "@tauri-apps/plugin-shell"

let result = await Command.create("exec-sh", [
  "-c",
  "echo 'Hello World!'",
]).execute()
console.log(result)
