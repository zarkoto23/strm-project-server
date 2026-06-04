import express from "express";
import { type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

app.use(cors());

const VIDEOS_PATH = "D:/SoftUni/strm-project/videos";

function getVideos() {
  try {
    const folders = fs.readdirSync(VIDEOS_PATH);
    const videos = [];

    for (const folder of folders) {
      const m3u8Path = path.join(VIDEOS_PATH, folder, "index.m3u8");
      if (fs.existsSync(m3u8Path)) {
        videos.push({
          id: folder,
          title: folder.replace(/_/g, " ").replace(/-/g, " "),
          playlist: `http://localhost:8080/hls/${folder}/index.m3u8`,
        });
      }
    }
    return videos;
  } catch (err) {
    console.log("грешка при четене на папка с видеа", err);
    return [];
  }
}

app.get("/videos", (req: Request, res: Response) => {
  const videos = getVideos();
  res.json(videos);
});

app.get("/videos/:id", (req: Request, res: Response) => {
  const videos = getVideos();
  const video = videos.find((v) => v.id === req.params.id);

  if (!video) {
    return res.status(404).json({ message: "not found" });
  }
  res.json(video);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node.js API running on: http://localhost:${PORT}`);
});
