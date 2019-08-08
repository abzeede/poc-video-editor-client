import React from 'react'
import { number, func } from 'prop-types'
import InputRange from 'react-input-range'
import './styles/controlbar.scss'

const ControlBar = (props) => {
  return (
    <div className={props.className}>
      <InputRange
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
  onChangeStart: func,
  onChangeComplete: func,
}

export default ControlBar
