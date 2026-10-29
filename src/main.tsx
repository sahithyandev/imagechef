import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { App } from "@/app/App";
import { AppProviders } from "@/app/AppProviders";
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
