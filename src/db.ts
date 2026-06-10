import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      playlist_path TEXT NOT NULL,
      description TEXT,
      year INTEGER,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const insertMovie = db.prepare(`
  INSERT OR IGNORE INTO movies (id, title, playlist_path) 
  VALUES (?, ?, ?)
`);

const moviesData = [
  {
    id: "knives-out",
    title: "Knives Out",
    playlist_path: "http://localhost:8080/hls/knives_out_1080/index.m3u8",
  },
  {
    id: "pirates-pearl",
    title: "Pirates of the Caribbean: The Curse of the Black Pearl",
    playlist_path: "http://localhost:8080/hls/curse_black_pearl/index.m3u8",
  },
];

moviesData.forEach((movie) => {
  insertMovie.run(movie.id, movie.title, movie.playlist_path);
});

console.log("Вмъкнати филми в базата (ако ги нямаше)");


export default db;