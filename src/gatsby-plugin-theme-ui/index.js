export default {
    colors: {
      text: '#fff',
      background: '#000',
      primary: 'blue',
    },
    fonts: {
      body: 'system, -apple-system, "San Francisco", Roboto, "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
      heading: 'inherit',
      monospace: 'Menlo, monospace',
    },
    fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
    fontWeights: {
      body: 400,
      heading: 700,
      display: 900,
    },
    lineHeights: {
      body: 1.65,
      heading: 1.25,
    },

    text: {
      heading: {
        fontFamily: 'heading',
        lineHeight: 'heading',
        fontWeight: 'heading',
        fontSize: 5,
        textTransform: 'capitalize'
      },
      display: {
        variant: 'text.heading',
        fontSize: [5, 6],
        fontWeight: 'display',
        letterSpacing: '-0.03em',
        mt: 3,
      },
      caps: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
    },

    styles: {
      Container: {
        p: 3,
        maxWidth: 1024,
      },
      root: {
        fontFamily: 'body',
        lineHeight: 'body',
        fontWeight: 'body',
        fontSize: 17,
        a:{
          color: 'primary',
          textDecoration:'none',
          '&:hover': {
            color: 'special'
          },
          '&.active': {
            color: 'special'
          },
        },
      },
    },
    
  }