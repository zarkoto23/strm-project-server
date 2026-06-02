import express from "express";
import path from "node:path";

const app = express();

const videos = [
  {
    id: "knives_out",
    title: "Knives Out (2019)",
    playlist: "/hls/knives_out/index.m3u8"
  },
  {
    id: "curse_black_pearl", 
    title: "Pirates of the Caribbean",
    playlist: "/hls/curse_black_pearl/index.m3u8"
  }
];

app.use("/hls", express.static(path.join(process.cwd(),"..","videos")))

app.get("/videos",(req, res )=>{
  res.json(videos)
})


app.get("/videos/:id",(req, res)=>{
  const video=videos.find(v=>v.id===req.params.id)
  if(!video){
    res.status(404).json({message:"Not Fount"})
    return
  }

  res.json(video)
})


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servers is running on: http://localhost:${PORT}`);
});
