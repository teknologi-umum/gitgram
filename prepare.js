import { exec } from "child_process";
import process from "process";

if (process.env.NODE_ENV === "production") {
  process.exit(0);
} else {
  exec("npx husky install", (error, stdout, stderr) => {
    if (error) throw error;
    stdout && process.stdout.write(stdout + "\n");
    stderr && process.stderr.write(stderr + "\n");
  });
}
