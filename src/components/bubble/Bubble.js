import React from 'react'

import { style } from '../../utils/common'
import popIcon from '../../assets/pop.png'
import './Bubble.css'

const Bubble = ({ circle }) => {
  return (
    <>
      <span
        className={`bubble ${circle.popped ? 'popped' : ''}`}
        style={style(circle)}
      >
        &nbsp;
      </span>
      <img
        className={`${circle.animatePop ? 'popped' : ''}`}
        src={popIcon}
        style={{
          position: 'absolute',
          top: circle.y - circle.radius,
          left: circle.x,
          display: circle.animatePop ? 'block' : 'none',
        }}
        alt='pop'
      />
    </>
  )
}

export default Bubble
