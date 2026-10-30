import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { App } from "@/app/app";
import { AppProviders } from "@/app/app-providers";
import "@/styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element was not found.");
}

hydrateRoot(
  rootElement,
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
