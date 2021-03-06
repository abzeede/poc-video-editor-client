import React, { useEffect, useRef, useReducer } from 'react'
import { number, string, object, func } from 'prop-types'
import videojs from 'video.js'
import ControlBar from './ControlBar'
import './styles/video_player.scss'

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
        currentPosition: state.startOffset
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
        currentPosition: action.payload
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

const VideoEditor = ({ video, startAt, endAt, setting, onOk }) => {
  let player = useRef()
  const [videoState, videoDispatch] = useReducer(videoReducer, {
    isPlaying: setting.autoplay,
    currentPosition: startAt,
    startOffset: startAt,
    endOffset: endAt,
    duration: 0,
  }) 

  const setupPlayer = () => {
    // setup
    player.current = videojs(player.current, setting)

    player.current.src({ src: video, type: 'video/mp4' })
    
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
    if (typeof videoState.endOffset !== 'undefined' && videoState.currentPosition > videoState.endOffset) {
      player.current.currentTime(videoState.startOffset)
    }
    
    // sync video playing state
    if (videoState.isPlaying && player.current.paused()) {
      player.current.play()
    } else if (!videoState.isPlaying && !player.current.paused()) {
      player.current.pause()
    }
  }, [ videoState ])

  // change currentPosition in video when currentPosition state change
  useEffect(() => {
    player.current.currentTime(videoState.startOffset)
  }, [ videoState.startOffset ])

  useEffect(() => {
    player.current.currentTime(videoState.endOffset)
  }, [ videoState.endOffset ])

  return (
    <div>
      <div className="video-container">
        <video ref={player} className="video-js vjs-default-skin" data-vjs-player type="video/mp4">
          Your browser does not support the video tag.
        </video>
        {
          videoState.endOffset && videoState.duration !== 0 && (
            <ControlBar
              duration={videoState.duration}
              currentTime={videoState.currentPosition}
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
      <button onClick={() => onOk(videoState)}>OK</button>
    </div>
  )
}

VideoEditor.propTypes = {
  video: string.isRequired,
  onOk: func,
  startAt: number,
  endAt: number,
  setting: object,
}

VideoEditor.defaultProps = {
  startAt: 0,
  onOk: () => {},
  setting: {
    fluid: true,
    autoplay: true,
    loop: true,
    controls: false,
  }
}

export default VideoEditor
