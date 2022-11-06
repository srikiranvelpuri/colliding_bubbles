import React from 'react'

import { style } from '../../utils/common'
import './Bubble.css'

const Bubble = ({ circle }) => {
  return (
    <span className={circle.popped ? 'popped' : ''} style={style(circle)}>
      &nbsp;
    </span>
  )
}

export default Bubble
