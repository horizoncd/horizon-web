export default {
  formRules: {
    url: [
      {
        required: true,
        // https://mathiasbynens.be/demo/url-regex
        // https://baidu.com
        pattern: new RegExp('^(https?)://[^\\s/$.?#].[^\\s]*$'),
        max: 256,
      },
    ],
    noRequiredURL: [
      {
        // https://mathiasbynens.be/demo/url-regex
        // https://baidu.com
        pattern: new RegExp('^(https?)://[^\\s/$.?#].[^\\s]*$'),
        max: 256,
      },
    ],
    domain: [
      {
        required: true,
        // baidu.com
        pattern: new RegExp('^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$'),
        max: 256,
      },
    ],
    noRequiredDomain: [
      {
        pattern: new RegExp('^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$'),
        max: 256,
      },
    ],
  },
};
