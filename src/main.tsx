import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css"; // global Tailwind + design tokens

// Mount React App ke root element
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
