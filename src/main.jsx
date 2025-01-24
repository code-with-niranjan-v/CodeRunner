import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CodeEditor from './codeEditor/CodeEditor.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/editor' element={<CodeEditor />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
