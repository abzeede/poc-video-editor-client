import React from 'react';
import VideoPlayer from './components/VideoPlayer'

function App() {
  return (
    <div className="App">
      <VideoPlayer video={require('./assets/video_10.mp4')} />
    </div>
  );
}

export default App;
