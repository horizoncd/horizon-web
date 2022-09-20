import { Component } from 'react';

// @ts-ignore
const withTrim = (WrappedComponent) => class extends Component {
  // @ts-ignore
  constructor(props) {
    super(props);
    this.state = { value: undefined };
  }

  // 去除头尾空格
  onChange = (e: any) => {
    e.target.value = e.target.value.trim();
    // @ts-ignore
    this.props.onChange(e);
  };

  render() {
    // @ts-ignore
    return <WrappedComponent {...this.props} onChange={this.onChange} />;
  }
};

export default withTrim;
