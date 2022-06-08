export default {
  formRules: {
    domain: [
      {
        required: true,
        // https://mathiasbynens.be/demo/url-regex
        pattern: new RegExp('^(https?)://[^\\s/$.?#].[^\\s]*$'),
        max: 256,
      }
    ]
  }
}
