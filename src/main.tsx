import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from './components/ui/sonner'
import { EditorScreen } from './features/editor/editor-screen'
import {
  forgetCompletedUpdate,
  updateOnStaleChunk,
} from './features/version-update/version-check'
import { VersionUpdateToast } from './features/version-update/version-update-toast'
import './styles.css'

const root = document.querySelector('#root')
if (!root) throw new Error('Missing #root element')

window.addEventListener('vite:preloadError', updateOnStaleChunk)
forgetCompletedUpdate()

createRoot(root).render(
  <StrictMode>
    <EditorScreen />
    <Toaster position="top-center" />
    <VersionUpdateToast />
  </StrictMode>,
)
