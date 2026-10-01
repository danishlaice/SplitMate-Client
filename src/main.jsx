import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { initStorageSafety } from "./utils/storage";

initStorageSafety();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2500,
        style: {
          background: "#0f172a",
          color: "#fff",
          border: "1px solid #334155",
        },
      }}
    />

    <App />
  </StrictMode>
);
