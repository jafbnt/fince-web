import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { AppToaster } from "@/components/app-toaster"
import { Drawer } from "@/hooks/drawer/Drawer"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <App />
        <Drawer />
        <AppToaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
