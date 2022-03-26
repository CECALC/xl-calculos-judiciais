const { resolve } = require('path')
const { existsSync, mkdirSync } = require('fs')

module.exports.ensureDirSync = function (dirPath) {
  if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true })
}

// https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
module.exports.formatXml = function (xml, tab = '  ') {
  let formatted = ''
  let indent = ''
  tab = tab || '\t'
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length)
    formatted += indent + '<' + node + '>\r\n'
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab
  })
  return formatted.substring(1, formatted.length - 3)
}

module.exports.isDev = process.env.NODE_ENV !== 'production'
module.exports.r = (...args) => resolve(process.cwd(), ...args)
