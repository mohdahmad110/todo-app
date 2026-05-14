import { Box } from '@mui/material'
import React from 'react'

export function DecorationPattern() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: -100,
        width: '600px',
        height: '600px',
        opacity: 0.3,
        pointerEvents: 'none',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <svg
        viewBox="0 0 600 600"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(23, 162, 184, 0.3))',
        }}
      >
        <defs>
          <pattern
            id="dots"
            x="15"
            y="15"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="15" cy="15" r="6" fill="#17A2B8" opacity="0.8" />
          </pattern>
        </defs>
        <path
          d="M 150 50 Q 200 80 250 70 T 350 90 L 400 150 Q 420 200 400 250 T 450 350 L 400 450 Q 350 480 300 470 T 150 500 L 100 400 Q 80 350 100 300 T 50 150 Z"
          fill="url(#dots)"
          stroke="none"
        />
      </svg>
    </Box>
  )
}
