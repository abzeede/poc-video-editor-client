import React, { useState } from 'react'
import VideoEditor from './components/VideoEditor'
import './app.css'

function extractFrames(file, startAt, endAt) {
  return new Promise((resolve, reject) => {
    let video = document.createElement('video')
    let images = []
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    let pro = document.querySelector('#progress')

    function initCanvas(e) {
      canvas.width = this.videoWidth
      canvas.height = this.videoHeight
    }

    function saveFrame(blob) {
      images.push(blob);
    }

    function onEnd(e) {
      resolve(images.map((image) => URL.createObjectURL(image)))
    }

    function drawFrame(e) {
      this.pause()
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(saveFrame, 'image/jpeg')
      pro.innerHTML = ((this.currentTime / endAt) * 100).toFixed(2) + ' %'
      if (this.currentTime < endAt) {
        this.play()
      } else {
        onEnd()
      }
    }
    
    video.muted = true;
    video.addEventListener('loadedmetadata', initCanvas, false)
    video.addEventListener('timeupdate', drawFrame, false)
    video.src = file
    video.currentTime = startAt
    video.play()
  })
}


function App() {
  const [ video, setVideo ] = useState()
  const [ extractedImgs, setExtractedImgs ] = useState([])

  return (
    <div className="app">
      <h1>Client side Video Trimmer (Experimental)</h1>
      <div>
        <h2>
          1. Choose video file to upload (support only mp4)
        </h2>
        <input type="file" accept="video/mp4" onChange={(e) => setVideo(URL.createObjectURL(e.target.files[0]))} />
      </div>
      <div>
        <h2>
          2. Trim Video
        </h2>
        {
          video && (
            <VideoEditor
              video={video}
              onOk={({ startOffset, endOffset }) => {
                return extractFrames(video, startOffset, endOffset).then(setExtractedImgs)
              }}
            />
          )
        }
      </div>
      <div id="progress"></div>
      {
        extractedImgs.map(image => {
          return <img key={image} src={image} />
        })
      }
    </div>
  )
}

export default App;
