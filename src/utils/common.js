export const rotate = (x, y, sin, cos, reverse) => {
  return reverse
    ? {
        x: cos * x + sin * y,
        y: cos * y - sin * x,
      }
    : {
        x: cos * x - sin * y,
        y: cos * y + sin * x,
      }
}

export const flatten = (arr) =>
  arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

export const style = (circle) => {
  return {
    top: `${circle.y}px`,
    left: `${circle.x}px`,
    boxShadow: `0 0 2rem hsl(${circle.hue}, 75%, 50%) inset`,
  }
}
