import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from "sonner"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        richColors
        // theme='light'
        position='top-right'
        closeButton
        duration={4000}
        // toastOptions={{
        //   classNames: {
        //     toast: "group toast !bg-[#0b0a12]/95 !border !border-violet-400/20 !text-white !rounded-2xl !shadow-2xl !shadow-violet-950/40 !backdrop-blur-xl",

        //     title: "!text-sm !font-semibold !text-white",

        //     description: "!text-xs !text-zinc-400",

        //     success: "!border-violet-400/25",

        //     error: "!border-red-400/20",

        //     closeButton: "!bg-white/5 !border-white/10 !text-zinc-400 hover:!bg-white/10",
        //   }
        // }}
      />
    </AuthProvider>
  </StrictMode>,
)
