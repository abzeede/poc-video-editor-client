import React, { useEffect, useRef, useReducer } from 'react'
import { number, string, object } from 'prop-types'
import videojs from 'video.js'
import ControlBar from './ControlBar'

const VIDEO = {
  play: 'play',
  pause: 'pause',
  stop: 'stop',
  goto: 'goto',
  setStartOffset: 'set/start_offset',
  setEndOffset: 'set/end_offset',
  setDuration: 'set/duration'
}

const videoReducer = (state, action) => {
  switch(action.type) {
    case VIDEO.play:
      return {
        ...state,
        isPlaying: true
      }
    case VIDEO.pause:
      return {
        ...state,
        isPlaying: false
      }
    case VIDEO.stop:
      return {
        ...state,
        isPlaying: false,
        position: state.startOffset
      }
    case VIDEO.setStartOffset:
      return {
        ...state,
        startOffset: action.payload
      }
    case VIDEO.setEndOffset:
      return {
        ...state,
        endOffset: action.payload
      }
    case VIDEO.goto:
      return {
        ...state,
        position: action.payload
      }
    case VIDEO.setDuration:
      return {
        ...state,
        duration: action.payload,
      }
    default:
      return state
  }
}

const VideoPlayer = ({ video, startAt, endAt, setting }) => {
  let player = useRef()
  const [videoState, videoDispatch] = useReducer(videoReducer, {
    isPlaying: setting.autoplay,
    position: startAt,
    startOffset: startAt,
    endOffset: endAt,
    duration: 0,
  }) 

  const setupPlayer = () => {
    // setup
    player.current = videojs(player.current, setting)
    
    // set start offset
    player.current.ready(() => {
      player.current.currentTime(startAt)
      player.current.play()
    })

    // set video duration and end offset when video player ready to give an information
    player.current.on('loadedmetadata', () => {
      videoDispatch({ type: VIDEO.setDuration, payload: player.current.duration() })
      if (typeof videoState.endOffset === 'undefined') {
        videoDispatch({ type: VIDEO.setEndOffset, payload: player.current.duration() })
      }
    })
    
    // update current time state
    player.current.on('timeupdate', () => {
      videoDispatch({ type: VIDEO.goto, payload: player.current.currentTime() })
    })
  }

  // first time setup
  useEffect(() => {
    setupPlayer()
  }, [])

  // update current time for video
  useEffect(() => {
    player.current.currentTime(videoState.startOffset)
  }, [ videoState.startOffset ])

  // sync video state
  useEffect(() => {
    // when video played over the end offset, it's going to start back at start offset
    if (typeof videoState.endOffset !== 'undefined' && videoState.position > videoState.endOffset) {
      player.current.currentTime(videoState.startOffset)
    }
    
    // sync video playing state
    if (videoState.isPlaying && player.current.paused()) {
      player.current.play()
    } else if (!videoState.isPlaying && !player.current.paused()) {
      player.current.pause()
    }
  }, [ videoState ])

  // change position in video when position state change
  useEffect(() => {
    player.current.currentTime(videoState.startOffset)
  }, [ videoState.startOffset ])

  useEffect(() => {
    player.current.currentTime(videoState.endOffset)
  }, [ videoState.endOffset ])

  return (
    <div style={{ border: 'solid 1px #e8e8e8', width: '50%', margin: '20px', position: 'relative' }}>
      <video ref={player} className="video-js vjs-default-skin" width="640px" height="267px" data-vjs-player>
        <source src={video} type="video/mp4" />    
        Your browser does not support the video tag.
      </video>
      {
        videoState.endOffset && videoState.duration !== 0 && (
          <ControlBar
            duration={videoState.duration}
            startAt={videoState.startOffset}
            endAt={videoState.endOffset}
            onChangeStart={value => {
              videoDispatch({ type: VIDEO.pause })
            }}
            onChangeComplete={value => {
              player.current.currentTime(videoState.startOffset)
              videoDispatch({ type: VIDEO.play })
            }}
            onChange={value => {
              if (value.min !== videoState.startOffset) {
                videoDispatch({ type: VIDEO.setStartOffset, payload: value.min })
              } else if (value.max !== videoState.endOffset) {
                videoDispatch({ type: VIDEO.setEndOffset, payload: value.max })
              }
            }}
          />
        )
      }
    </div>
  )
}

VideoPlayer.propTypes = {
  video: string.isRequired,
  startAt: number,
  endAt: number,
  setting: object,
}

VideoPlayer.defaultProps = {
  startAt: 0,
  setting: {
    fluid: true,
    autoplay: true,
    loop: true,
    controls: false,
  }
}

export default VideoPlayer
