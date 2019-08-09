import React from 'react'
import { number, func } from 'prop-types'
import InputRange from 'react-input-range'
import './styles/controlbar.scss'

const ControlBar = (props) => {
  const getNavigationPosition = (currentTime, duration) => {
    return (currentTime / duration) * 100
  }
  const navigatorOffset = getNavigationPosition(props.startAt, props.duration)
  const navigatorPosition = getNavigationPosition(props.currentTime, props.duration) - navigatorOffset
  
  return (
    <div className="video-container__control-bar">
      <div
        className="video-container__control-bar__navigator"
        style={{ width: `${navigatorPosition}%`, left: `${navigatorOffset}%`}}>
      </div>
      <InputRange
        step={0.2}
        maxValue={props.duration}
        minValue={0}
        onChangeStart={props.onChangeStart}
        onChangeComplete={props.onChangeComplete}
        value={{ min: props.startAt, max: props.endAt }}
        onChange={props.onChange}
      />
    </div>
  )
}

ControlBar.propTypes = {
  duration: number.isRequired,
  onChange: func.isRequired,
  startAt: number.isRequired,
  endAt: number.isRequired,
  currentTime: number.isRequired,
  onChangeStart: func,
  onChangeComplete: func,
}

export default ControlBar
