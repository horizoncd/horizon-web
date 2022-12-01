import React from 'react';
import { ThemeProvider } from 'styled-components';

const theme: Theme = {
  color: {
    emphasis: '#1890ff',
    danger: '#ff4d4f',
  },
  fontFamily: 'sans-serif',
  fontSize: {
    xsmall: '0.5em',
    small: '0.8em',
    medium: '1em',
    large: '1.2em',
    xlarge: '1.5em',
    xxlarge: '2em',
  },
  fontWeight: {
    bold: '700',
    normal: '400',
    light: '300',
  },
};

function WithTheme(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

export default WithTheme;
