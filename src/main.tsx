import { createRoot } from "react-dom/client";
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import App from "./App.tsx";
import "./index.css";

// Notify Capacitor that the app has loaded successfully
CapacitorUpdater.notifyAppReady();

createRoot(document.getElementById("root")!).render(<App />);
