import db from "./db.ts"
import express from "express";
import { type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";


const app = express();

app.use(cors());

let cachedMovies: Array<{ id: string; title: string; playlist: string }> = [];
let lastScanTime = 0;

const SCAN_INTERVAL_MS = 24 * 60 * 60 * 1000;

const MOVIES_PATH = "E:\movies-m3u8";

// В index.ts, след като импортираш db:
db.get("SELECT COUNT(*) as count FROM movies", (err, row: { count: number }) => {
  if (err) console.error(err);
  else console.log(`Брой редове в таблицата movies: ${row.count}`);
});

function getMovies() {
  const now = Date.now();
  if (now - lastScanTime > SCAN_INTERVAL_MS) {
    console.log("сканиране на файловете от базата");

    try {
        const folders=fs.readdirSync(MOVIES_PATH)
        const foundIds:string[]=[]


        for (const folder of folders){
          const m3u8Path=path.join(MOVIES_PATH, folder, "index.m3u8")
          if(fs.existsSync(m3u8Path)){
            foundIds.push(folder)
            const playlistUrl=`http://localhost:8080/hls/${folder}/index.m3u8`

            db.run(
            `INSERT INTO movies (id, title, playlist_path) 
             VALUES (?, ?, ?) 
             ON CONFLICT(id) DO UPDATE SET 
               title = excluded.title, 
               playlist_path = excluded.playlist_path`,
            [folder, folder, playlistUrl]
          );
          }
        }


        if(foundIds.length>0){
          const placeholders=foundIds.map(()=>"?").join(",")
          db.run(`DELETE FROM movies WHERE id NOT IN (${placeholders})`, foundIds);
        }else{
           db.run("DELETE FROM movies");
        }

         const stmt = db.prepare("SELECT id, title, playlist_path as playlist FROM movies");
      cachedMovies = stmt.all() as unknown as Array<{ id: string; title: string; playlist: string }>;
      lastScanTime = now;
    } catch (err:unknown)  {
      console.error("Грешка при синхронизация:", err);
    }
  } else {
    console.log("използва се кеширания списък");
  }
  return cachedMovies;
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
