import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0F1419',
      paper: '#1a1f2e',
    },
    primary: {
      main: '#FFD700', // Yellow/Gold
      light: '#FFED4E',
      dark: '#DAA500',
      contrastText: '#0F1419',
    },
    secondary: {
      main: '#17A2B8', // Light Blue
      light: '#5DADE2',
      dark: '#0C5B74',
      contrastText: '#fff',
    },
    error: {
      main: '#FF6B6B',
    },
    success: {
      main: '#51CF66',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B8C0',
    },
    divider: '#2C3E50',
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.5px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(255, 215, 0, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #FFD700 0%, #DAA500 100%)',
          color: '#0F1419',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFED4E 0%, #FFD700 100%)',
          },
        },
        outlined: {
          borderColor: '#FFD700',
          color: '#FFD700',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#FFED4E',
            color: '#FFED4E',
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2C3E50',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#3F5166',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#FFD700',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFD700',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#FFFFFF',
            fontSize: '1rem',
            padding: '12px 14px',
            '&::placeholder': {
              color: '#9CA3AF',
              opacity: 1,
            },
          },
          '& .MuiInputAdornment-positionEnd': {
            marginRight: '4px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1f2e',
          backgroundImage: 'linear-gradient(180deg, rgba(26, 31, 46, 1) 0%, rgba(76, 45, 67, 0.2) 100%)',
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: '0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid #2C3E50',
          padding: '12px 0',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: 500,
        },
        standardError: {
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          color: '#FF6B6B',
          border: '1px solid rgba(255, 107, 107, 0.3)',
        },
        standardSuccess: {
          backgroundColor: 'rgba(81, 207, 102, 0.1)',
          color: '#51CF66',
          border: '1px solid rgba(81, 207, 102, 0.3)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
})
