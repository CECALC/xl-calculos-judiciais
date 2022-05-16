const { readFileSync, writeFileSync } = require('fs')
const { r, isDev } = require('./helpers')
const { name, port, version } = require('../package.json')

function copiarManifesto() {
  let data = readFileSync(r('src/manifest.xml'), 'utf-8')
  data = data
    .replace(
      /\{\{base\}\}/g,
      isDev ? `https://localhost:${port}` : `https://cecalc.github.io/${name}`
    )
    .replace(/\{\{version\}\}/g, version)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[^\S\r\n]+\n/g, '')
    .replace(/\n+/g, '\n')
  writeFileSync(r(isDev ? `src/${name}-dev.xml` : 'public/manifest.xml'), data, 'utf-8')
}

copiarManifesto()
