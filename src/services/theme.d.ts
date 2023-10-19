interface Color {
  emphasis: string,
  warning: string,
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

interface FontWeight {
  light: string,
  normal: string,
  bold: string,
}

interface Theme {
  color: Color,
  fontFamily: string,
  fontSize: FontSize,
  fontWeight: FontWeight,
}
