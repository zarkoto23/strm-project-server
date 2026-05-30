import express from "express";
import path from "node:path";
import fs from "fs";

const app = express();

app.get("/stream/:file", (req, res) => {
  const filePath = path.join(process.cwd(), "videos", req.params.file);

  const stat = fs.statSync(filePath);

  const fileSize = stat.size;

  const range = req.headers.range;

  if (!range) {
    res.status(400).send("Missing Range headers");
    return;
  }

  const CHUNK_SIZE = 10 ** 6;

  const start = Number(range.split("=")[1]!.split("-")[0]);

  const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

  const file = fs.createReadStream(filePath, { start, end });

  const contentLength = end - start + 1;

  res.writeHead(206, {
    "content-range": `bytes ${start}-${end}/${fileSize}`,
    "accept-ranges": "bytes",
    "content-length": contentLength,
    "content-type": "video/mp4",
  });

  file.pipe(res);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servers is running on: http://localhost:${PORT}`);
});
