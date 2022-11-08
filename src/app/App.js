import React, { useEffect, useState, useRef } from 'react'

import Bubble from '../components/bubble'
import CustomAppBar from '../components/appbar'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { distance, randomIntFromRange, resolveCollision } from '../utils/common'
import './App.css'

const App = () => {
  let circles = useRef([])
  let appBarRef = useRef(null)
  let appRef = useRef(null)
  let globalId = useRef(null)
  let bubbleRef = useRef(null)
  let audioRef = useRef(null)

  const popAudio = require('../assets/pop.mp3')

  const [dummyState, setDummyState] = useState([])
  const [hiddenProperty, setHiddenProperty] = useState(null)
  const [visibilityChangeEvent, setVisibilityChange] = useState(null)
  const [moving, setMoving] = useState(true)

  const bubbletrouble = JSON.parse(localStorage.getItem('bubbletrouble'))
  const [isDark, setDark] = useState(bubbletrouble?.isDark || false)
  const [allowAudio, setAllowAudio] = useState(
    bubbletrouble?.allowAudio || false
  )

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  // const lightTheme = createTheme({
  //   palette: {
  //     mode: 'light',
  //   },
  // })

  const update = () => {
    if (!moving) {
      return
    }

    var box = appRef.current?.getBoundingClientRect()
    var radius = bubbleRef.current?.getBoundingClientRect()?.width
    var padding = appBarRef.current?.getBoundingClientRect()?.height

    circles.current?.forEach((c1) => {
      circles.current?.forEach((c2) => {
        if (c1 !== c2) {
          if (distance(c1.x, c2.x, c1.y, c2.y) < radius * 2) {
            resolveCollision(c1, c2)
          }
        }
      })
    })

    setDummyState([]) // hack to rerender ;)

    circles.current.forEach((c) => {
      if (c.x - radius <= 0 || c.x + radius >= box?.width) {
        c.velocity.x = -c.velocity.x
        c.hue += 20
      }
      if (
        c.y - radius - padding <= 0 ||
        c.y + radius >= box?.height + padding
      ) {
        c.velocity.y = -c.velocity.y
        c.hue += 20
      }
      c.x += c.velocity.x
      c.y += c.velocity.y
    })

    globalId.current = requestAnimationFrame(update)
  }

  const handleVisibilityChange = () => {
    if (!document[hiddenProperty]) {
      globalId.current = requestAnimationFrame(update)
      setMoving(true)
    } else {
      cancelAnimationFrame(globalId)
      setMoving(false)
    }
  }

  const handleClick = (evt) => {
    let m = {
      x: evt.pageX,
      y: evt.pageY,
    }
    let nearest = null
    let nearest_distsq = Infinity
    let dx, dy, distsq
    circles.current.forEach((c) => {
      dx = m.x - c.x
      dy = m.y - c.y
      distsq = dx * dx + dy * dy
      if (distsq < nearest_distsq && distsq < c.radius * c.radius) {
        nearest = c
        nearest_distsq = distsq
      }
    })
    if (nearest) {
      if (allowAudio) {
        audioRef.current?.play()
        if (navigator.vibrate) navigator.vibrate([100])
      }
      nearest.popped = true
      nearest.animatePop = true
      setTimeout(() => {
        nearest.animatePop = false
      }, 200)
      setTimeout(() => {
        nearest.popped = false
      }, 1000)
    }
  }

  useEffect(() => {
    var box = appRef.current?.getBoundingClientRect()
    var radius = bubbleRef.current?.getBoundingClientRect()?.width
    var padding = appBarRef.current?.getBoundingClientRect()?.height
    var max = (box?.width * box?.height) / 300 / Math.pow(radius, 1.2)
    circles.current = []
    for (let i = 0; i < max; i++) {
      let x = randomIntFromRange(radius, box?.width - radius)
      let y = randomIntFromRange(
        radius + padding,
        box?.height - radius - padding
      )
      if (i !== 0) {
        for (let j = 0; j < circles.current.length; j++) {
          if (
            distance(x, circles.current[j].x, y, circles.current[j].y) <
            radius * 2
          ) {
            x = randomIntFromRange(radius, box?.width - radius)
            y = randomIntFromRange(
              radius + padding,
              box?.height - radius - padding
            )
            j = -1
          }
        }
      }
      circles.current.push({
        x,
        y,
        velocity: {
          x: Math.random() - 0.5,
          y: Math.random() - 0.5,
        },
        hue: Math.random() * 360,
        mass: 1,
        radius: radius,
        popped: false,
        animatePop: false,
      })
    }

    globalId.current = requestAnimationFrame(update)

    var hidden, visibilityChange
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden'
      visibilityChange = 'visibilitychange'
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden'
      visibilityChange = 'msvisibilitychange'
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden'
      visibilityChange = 'webkitvisibilitychange'
    }
    setHiddenProperty(hidden)
    setVisibilityChange(visibilityChange)

    document.addEventListener(
      visibilityChangeEvent,
      handleVisibilityChange,
      false
    )

    return () => {
      document.removeEventListener(
        visibilityChangeEvent,
        handleVisibilityChange,
        false
      )
    }
  }, [])

  return (
    <div className='container'>
      <ThemeProvider theme={darkTheme}>
        <CustomAppBar
          title='Colliding Bubbles'
          abref={appBarRef}
          allowAudio={allowAudio}
          isDark={isDark}
          setDark={setDark}
          setAllowAudio={setAllowAudio}
        />

        <div
          id='app'
          onClick={(event) => handleClick(event)}
          ref={appRef}
          data-dark
        >
          <i id='bubbleradius' ref={bubbleRef} />

          {circles.current.map((circle, index) => (
            <Bubble circle={circle} key={index} />
          ))}
          <audio ref={audioRef}>
            <source src={popAudio} type='audio/mp3' />
          </audio>
        </div>
      </ThemeProvider>
    </div>
  )
}

export default App
