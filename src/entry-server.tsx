import { renderToString } from "react-dom/server";

import { App } from "@/app";
import { AppProviders } from "@/app-providers";

export function render() {
  return renderToString(
    <AppProviders>
      <App />
    </AppProviders>,
  );
}
