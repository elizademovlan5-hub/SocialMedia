import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1877f2',
    },
    background: {
      default: '#f0f2f5',
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default theme;