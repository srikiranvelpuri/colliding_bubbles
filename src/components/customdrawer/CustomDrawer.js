import React, { useState } from 'react'
import {
  Box,
  List,
  Divider,
  ListItem,
  IconButton,
  ListItemText,
  SwipeableDrawer,
} from '@mui/material'
// import Toggle from './Toggle'
import { Audiotrack, MusicOff, GitHub, Menu } from '@mui/icons-material'

const CustomDrawer = ({ isDark, setDark, allowAudio, setAllowAudio }) => {
  const [state, setState] = useState(false)
  const bubbletrouble = JSON.parse(localStorage.getItem('bubbletrouble'))
  const toggleDrawer = (open) => (event) => {
    if (
      event?.type === 'keydown' &&
      (event?.key === 'Tab' || event?.key === 'Shift')
    ) {
      return
    }

    setState(open)
  }

  const componentMapper = {
    playAudio: {
      cond: allowAudio,
      component: () => (
        <IconButton
          onClick={() => {
            setAllowAudio(!allowAudio)
            localStorage.setItem(
              'bubbletrouble',
              JSON.stringify({ ...bubbletrouble, allowAudio: !allowAudio })
            )
          }}
        >
          {allowAudio ? <Audiotrack /> : <MusicOff />}
        </IconButton>
      ),
    },
    // Theme: {
    //   cond: isDark,
    //   component: () => (
    //     <Toggle
    //       handleChange={() => {
    //         setDark(!isDark)
    //         localStorage.setItem(
    //           'bubbletrouble',
    //           JSON.stringify({ ...bubbletrouble, isDark: !isDark })
    //         )
    //       }}
    //       val={isDark}
    //     />
    //   ),
    // },
  }

  const locale = (text, cond) =>
    ({
      Theme: cond ? 'Dark Theme' : 'Light Theme',
      playAudio: cond ? 'Sound on' : 'Sound off',
    }[text])

  const list = () => (
    <Box sx={{ width: 250 }} role='presentation'>
      <List>
        {Object.keys(componentMapper).map((text, index) => (
          <ListItem key={index} onClick={toggleDrawer(false)}>
            <ListItemText primary={locale(text, componentMapper[text]?.cond)} />
            {componentMapper[text].component()}
          </ListItem>
        ))}
        <Divider />
        <IconButton
          onClick={() =>
            window.open('https://github.com/srikiran1707', '_blank')
          }
        >
          <GitHub />
          <span style={{ fontSize: '.75rem', paddingLeft: '5px' }}>
            Developed by <strong>Srikiran Velpuri</strong>
          </span>
        </IconButton>
      </List>
    </Box>
  )
  return (
    <>
      <IconButton
        aria-label='menu'
        onClick={toggleDrawer(true)}
        style={{ color: 'white' }}
      >
        <Menu />
      </IconButton>
      <SwipeableDrawer
        anchor='right'
        open={state}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        {list()}
      </SwipeableDrawer>
    </>
  )
}

export default CustomDrawer
