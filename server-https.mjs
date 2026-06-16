// Serves the PRODUCTION build over HTTPS on the LAN, so phones get a secure
// context (required for the camera / getUserMedia) and reliable hydration.
//
//   npm run build && node server-https.mjs
//
// TLS cert is the local one from mkcert in ./certs (see README). Next handles
// the request directly (no proxy), so Server Actions' origin check still passes.
import { createServer } from "node:https";
import { readFileSync } from "node:fs";
import next from "next";

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

await app.prepare();

createServer(
  {
    key: readFileSync("./certs/key.pem"),
    cert: readFileSync("./certs/cert.pem"),
  },
  (req, res) => handle(req, res),
).listen(port, "0.0.0.0", () => {
  console.log(`▲ Production HTTPS server ready on https://0.0.0.0:${port}`);
});
