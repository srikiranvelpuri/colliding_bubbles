import React from 'react'
import CustomDrawer from '../customdrawer'
import './CustomAppbar.css'

const CustomAppBar = ({
  title,
  abref,
  isDark,
  setDark,
  allowAudio,
  setAllowAudio,
}) => {
  return (
    <div className='appbar' ref={abref}>
      <h1>{title}</h1>
      <CustomDrawer
        isDark={isDark}
        setDark={setDark}
        allowAudio={allowAudio}
        setAllowAudio={setAllowAudio}
      />
    </div>
  )
}
export default CustomAppBar
