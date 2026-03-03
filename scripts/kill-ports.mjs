import { execSync } from "child_process";

const ports = [5173, 5174, 5175, 4173, 3000];

ports.forEach((port) => {
  try {
    const pids = execSync(
      `lsof -t -iTCP:${port} -sTCP:LISTEN || true`
    )
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);

    pids.forEach((pid) => {
      try {
        process.kill(pid, "SIGKILL");
        console.log(`Killed PID ${pid} on port ${port}`);
      } catch {}
    });
  } catch {}
});

console.log("Port cleanup complete.");
