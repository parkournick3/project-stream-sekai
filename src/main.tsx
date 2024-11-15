import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      expand
      richColors
      theme="light"
      toastOptions={{ className: "text-xl" }}
      position="top-center"
    />
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>
);
