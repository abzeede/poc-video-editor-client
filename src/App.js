import React, { useState } from "react";
import VideoEditor from "./components/VideoEditor";
import "./app.css";

function trimVideo({ file, startAt, endAt, onProcessing }) {
  return new Promise((resolve, reject) => {
    let video = document.createElement("video");
    let images = [];
    let canvas = document.createElement("canvas");
    let preview = document.getElementById("preview-video");
    let ctx = canvas.getContext("2d");
    const mediaStream = canvas.captureStream(25);
    preview.srcObject = mediaStream;

    function initCanvas(e) {
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
    }

    function onEnd(e) {}

    function saveFrame(blob) {
      images.push(blob);
    }

    function drawFrame(e) {
      this.pause();
      ctx.drawImage(video, 0, 0);
      onProcessing(((this.currentTime / endAt) * 100).toFixed(2));
      if (this.currentTime < endAt) {
        this.play();
      } else {
        onEnd();
      }
    }

    video.muted = true;
    video.addEventListener("loadedmetadata", initCanvas, false);
    video.addEventListener("timeupdate", drawFrame, false);
    video.src = file;
    video.currentTime = startAt;
    video.play();
  });
}

function App() {
  const [video, setVideo] = useState();
  const [progress, setProgress] = useState(0);

  return (
    <div className="app">
      <h1>Client side Video Trimmer (Experimental)</h1>
      <div>
        <h2>1. Choose video file to upload (support only mp4)</h2>
        <input
          type="file"
          accept="video/mp4"
          onChange={e => setVideo(URL.createObjectURL(e.target.files[0]))}
        />
      </div>
      <div>
        <h2>2. Trim Video</h2>
        {video && <VideoEditor video={video} onOk={onTrimVideo} />}
      </div>
      <div id="progress">{progress}%</div>
      <video id="preview-video" width={600} height={500} />
    </div>
  );
}

export default App;
