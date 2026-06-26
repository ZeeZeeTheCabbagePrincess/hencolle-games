const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const editableFiles = {
  "app.js": path.join(root, "app.js"),
  "events.js": path.join(root, "events.js"),
  "index.html": path.join(root, "index.html"),
  "sponsor-item-effects.js": path.join(root, "sponsor-item-effects.js"),
  "sponsor-items.js": path.join(root, "sponsor-items.js"),
  "sponsorship-editor-data.json": path.join(root, "sponsorship-editor-data.json"),
  "status-effects.js": path.join(root, "status-effects.js"),
  "status-editor-data.json": path.join(root, "status-editor-data.json"),
  "styles.css": path.join(root, "styles.css")
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function isLocalRequest(req) {
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function validateJsSource(content) {
  // Parse-only syntax check for editable JS files before writing them.
  new Function(content);
}

async function handleEditorApi(req, res, url) {
  if (!isLocalRequest(req)) {
    sendJson(res, 403, { error: "Editor API is only available from this Windows machine." });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/editor/files") {
    sendJson(res, 200, {
      files: Object.keys(editableFiles).map((name) => ({ name }))
    });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/editor/file") {
    const name = url.searchParams.get("name");
    const filePath = editableFiles[name];
    if (!filePath) {
      sendJson(res, 404, { error: "Unknown editable file." });
      return true;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      sendJson(res, 200, { name, content });
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/editor/file") {
    try {
      const body = JSON.parse(await readRequestBody(req) || "{}");
      const { name, content } = body;
      const filePath = editableFiles[name];

      if (!filePath) {
        sendJson(res, 404, { error: "Unknown editable file." });
        return true;
      }

      if (typeof content !== "string") {
        sendJson(res, 400, { error: "File content must be a string." });
        return true;
      }

      if (path.extname(filePath) === ".js") {
        validateJsSource(content);
      }

      fs.writeFileSync(filePath, content, "utf8");
      sendJson(res, 200, { ok: true, name, savedAt: new Date().toISOString() });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  return false;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);

  if (url.pathname.startsWith("/api/editor/")) {
    const handled = await handleEditorApi(req, res, url);
    if (handled) {
      return;
    }
  }

  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(root, requestPath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "text/plain; charset=utf-8"
    });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`The Hencolle Games server is running on http://${host}:${port}`);
});
