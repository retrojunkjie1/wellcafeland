import net from "net";

const ports = [5173, 5174, 5175, 5176, 5180];

const checkPort = (port) =>
  new Promise((resolve) => {
    const server = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        server.close();
        resolve(true);
      })
      .listen(port, "0.0.0.0");
  });

for (const port of ports) {
  const free = await checkPort(port);
  if (free) {
    console.log(`Suggested free port: ${port}`);
    process.exit(0);
  }
}

console.log("No free ports in suggested range.");
