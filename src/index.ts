import express from "express";
import { type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

app.use(cors());

const MOVIES_PATH = "E:\movies-m3u8";

function getMovies() {
  try {
    const folders = fs.readdirSync(MOVIES_PATH);
    const movies = [];

    for (const folder of folders) {
      const m3u8Path = path.join(MOVIES_PATH, folder, "index.m3u8");
      if (fs.existsSync(m3u8Path)) {
        movies.push({
          id: folder,
          title: folder,
          playlist: `http://localhost:8080/hls/${folder}/index.m3u8`,
        });
      }
    }
    return movies;
  } catch (err) {
    console.log("грешка при четене на папка с видеа", err);
    return [];
  }
}

app.get("/movies", (req: Request, res: Response) => {
  const movies = getMovies();
  res.json(movies);
});

app.get("/movies/:id", (req: Request, res: Response) => {
  const movies = getMovies();
  const movie = movies.find((v) => v.id === req.params.id);

  if (!movie) {
    return res.status(404).json({ message: "not found" });
  }
  res.json(movie);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node.js API running on: http://localhost:${PORT}`);
});
