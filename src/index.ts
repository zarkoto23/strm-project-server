import express from "express";
import path from "node:path";
import fs from "fs";

const app = express();


const videos = [
  {
    id: "video01",
    title: "Sample Video 1",
    file: "video01.mp4",
  },
  {
    id: "video02",
    title: "Sample Video 2",
    file: "video02.mp4",
  },
];


//STREAM
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

  const cleanRange = range.replace("bytes=", "");
  const parts = cleanRange.split("-");
  const start = parts[0] ? parseInt(parts[0], 10) : 0;

  const end = parts[1]
    ? parseInt(parts[1], 10)
    : Math.min(start + CHUNK_SIZE - 1,fileSize-1);

  if (start < 0 || end >= fileSize || start > end) {
    res.status(416).send("Invalid range!!-s");
    return
  }

  const contentLength = end - start + 1;

  res.writeHead(206, {
    "content-range": `bytes ${start}-${end}/${fileSize}`,
    "accept-ranges": "bytes",
    "content-length": contentLength,
    "content-type": "video/mp4",
  });

  const file = fs.createReadStream(filePath, { start, end });

  file.pipe(res);
});



//VIDEOS
app.get("/videos",(req,res)=>{
  res.json(videos)
})

app.get("/videos/:id",(req,res)=>{
  const video=videos.find(v=>v.id===req.params.id)

  if(!video){
    res.status(404).json({message: "not ffound"})
    return
  }

  res.json(video)
})

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servers is running on: http://localhost:${PORT}`);
});
