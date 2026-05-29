import express from "express";
import path from "path"

const app = express();

// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({ message: "Api is working" });
// });

// app.post("/test", (req, res) => {
//   console.log(req.body);
//   res.json(req.body);
// });


const videoPath=path.join(process.cwd(),"videos")

app.use("/videos", express.static(videoPath))

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servers is running on: http://localhost:${PORT}`);
});
