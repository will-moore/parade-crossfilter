// import { StrictMode } from 'react'
// StrictMode causes e.g. <ChooseData /> to render twice in dev mode.
// https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("main.jsx...");
createRoot(document.getElementById('root')).render(
  <App />
)
