const { readFileSync, writeFileSync } = require('fs')
const { r, isDev } = require('./helpers')

function copiarManifesto() {
  const version = process.env.npm_package_version
  let data = readFileSync(r('src/manifest.xml'), 'utf-8')
  data = data
    .replace(
      /\{\{base\}\}/g,
      isDev ? `https://localhost:3000` : 'https://cecalc.github.io/xl-calculos-judiciais'
    )
    .replace(/\{\{version\}\}/g, version)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[^\S\r\n]+\n/g, '')
    .replace(/\n+/g, '\n')
  writeFileSync(r('public/manifest.xml'), data, 'utf-8')
}

copiarManifesto()
