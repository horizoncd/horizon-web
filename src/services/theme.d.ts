interface Color {
  emphasis: string,
  danger: string,
}

interface FontSize {
  xsmall: string,
  small: string,
  medium: string,
  large: string,
  xlarge: string,
  xxlarge: string,
}

interface Theme {
  color: Color,
  fontFamily: string,
  fontSize: FontSize,
  fontWeight: string,
}
