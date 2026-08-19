import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const app = await buildApp({ config });

  try {
    await app.listen({ host: "0.0.0.0", port: config.port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
