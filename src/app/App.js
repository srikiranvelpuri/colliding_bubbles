import React, { useEffect, useRef, useState } from 'react'
import { rotate, flatten } from '../utils/common'
import Bubble from '../components/bubble'
import './App.css'

const App = () => {
  let circles = useRef([])
  let lastExec = useRef(null)
  let appRef = useRef(null)
  let globalId = useRef(null)
  let bubbleRef = useRef(null)
  let audioRef = useRef(null)

  const popAudio = require('../assets/pop.mp3')

  const [lastCollisions, setLastCollisions] = useState([])
  const [hiddenProperty, setHiddenProperty] = useState(null)
  const [visibilityChangeEvent, setVisibilityChange] = useState(null)
  const [moving, setMoving] = useState(true)

  const update = (tm) => {
    if (!moving) {
      return
    }
    if (lastExec.current && circles.current?.length) {
      var diff = tm - lastExec.current
      var box = appRef.current?.getBoundingClientRect()
      var radius = bubbleRef.current?.getBoundingClientRect()?.width
      var couples = []
      circles.current
        ?.filter((cc) => !cc.popped)
        ?.forEach((c1) => {
          circles.current
            ?.filter((cc) => !cc.popped)
            ?.forEach((c2) => {
              if (c1 !== c2) {
                couples.push([c1, c2])
              }
            })
        })

      var collisions = couples.filter((couple) => {
        var dist = Math.sqrt(
          Math.pow(couple[0].y - couple[1].y, 2) +
            Math.pow(couple[0].x - couple[1].x, 2)
        )
        return dist < radius * 2
      })

      var newcollisions = collisions.filter((couple) => {
        var key = couple[0].key + couple[1].key
        return lastCollisions.indexOf(key) < 0
      })

      newcollisions.forEach((couple) => {
        var a = couple[0]
        var b = couple[1]

        if (a.collisionFree && b.collisionFree) {
          if (!(a.collisionFree || b.collisionFree)) {
            a.new_vx =
              (a.vx * (a.mass - b.mass) + 2 * b.mass * b.vx) / (a.mass + b.mass)
            a.new_vy =
              (a.vy * (a.mass - b.mass) + 2 * b.mass * b.vy) / (a.mass + b.mass)
          } else {
            var dx = b.x - a.x
            var dy = b.y - a.y
            var collisionAngle = Math.atan2(dy, dx)
            var sin = Math.sin(collisionAngle)
            var cos = Math.cos(collisionAngle)
            var pos_a = { x: 0, y: 0 }
            var pos_b = rotate(dx, dy, sin, cos, true)
            var vel_a = rotate(a.vx, a.vy, sin, cos, true)
            var vel_b = rotate(b.vx, b.vy, sin, cos, true)
            var vxTotal = vel_a.x - vel_b.x
            vel_a.x =
              ((a.mass - b.mass) * vel_a.x + 2 * b.mass * vel_b.x) /
              (a.mass + b.mass)
            vel_b.x = vxTotal + vel_a.x
            pos_a.x += vel_a.x
            pos_b.x += vel_b.x

            var pos_a_final = rotate(pos_a.x, pos_a.y, sin, cos, false)
            var vel_a_final = rotate(vel_a.x, vel_a.y, sin, cos, false)
            a.new_x = a.x + pos_a_final.x
            a.new_y = a.y + pos_a_final.y
            a.new_vx = vel_a_final.x
            a.new_vy = vel_a_final.y
          }
        }
      })

      newcollisions.forEach((couple) => {
        var a = couple[0]
        if (a.new_vy) {
          a.vx = a.new_vx
          a.vy = a.new_vy
          a.x = a.new_x
          a.y = a.new_y
          a.hue += 20
        }
      })

      setLastCollisions(
        collisions.map((couple) => {
          return couple[0].key + couple[1].key
        })
      )

      var collided = [...new Set(flatten(newcollisions))]
      var collidedKeys = collided.map((c) => c.key)

      circles.current.forEach((c) => {
        c.collisionFree = c.collisionFree || collidedKeys.indexOf(c.key) < 0
        if (c.y < 0) {
          c.vy = Math.abs(c.vy)
        } else if (c.y > box.height) {
          c.vy = -Math.abs(c.vy)
        }
        if (c.x < 0) {
          c.vx = Math.abs(c.vx)
        } else if (c.x > box.width) {
          c.vx = -Math.abs(c.vx)
        }

        c.y += c.vy * diff
        c.x += c.vx * diff
      })
    }

    lastExec.current = tm
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
      audioRef.current?.play()
      if (navigator.vibrate) navigator.vibrate([100])
      nearest.popped = true

      setTimeout(() => {
        nearest.popped = false
      }, 1000)
    }
  }

  useEffect(() => {
    var box = appRef.current?.getBoundingClientRect()
    var radius = bubbleRef.current?.getBoundingClientRect()?.width
    var max = (box?.width * box?.height) / 300 / Math.pow(radius, 1.2)
    circles.current = []
    for (var i = 0; i < max; i++) {
      circles.current.push({
        key: Math.random(),
        y: Math.random() * box?.height,
        x: Math.random() * box?.width,
        vx: Math.random() / 5,
        vy: Math.random() / 5,
        hue: Math.random() * 360,
        collisionFree: false,
        mass: 1,
        radius: radius,
        popped: false,
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
    <div id='app' onClick={(event) => handleClick(event)} ref={appRef}>
      <i id='bubbleradius' ref={bubbleRef} />
      {circles.current.map((circle, index) => (
        <Bubble circle={circle} key={index} />
      ))}
      <audio ref={audioRef}>
        <source src={popAudio} type='audio/mp3' />
      </audio>
    </div>
  )
}

export default App
