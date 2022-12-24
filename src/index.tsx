import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import './index.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { Carregando } from './Carregando'
import { mergeStyles } from '@fluentui/react'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import reportWebVitals from './reportWebVitals'
import { depurador } from './utils'

initializeIcons()

// Inject some global styles
mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    height: '100vh'
  }
})

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <Carregando />
  </React.StrictMode>
)

Office.onReady(({ host, platform }) => {
  root.render(
    <React.StrictMode>
      <App host={host} platform={platform} />
    </React.StrictMode>
  )
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(depurador.console.log)
