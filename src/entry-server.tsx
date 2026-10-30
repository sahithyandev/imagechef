import { renderToString } from "react-dom/server";

import { App } from "@/app/app";
import { AppProviders } from "@/app/app-providers";

export function render() {
  return renderToString(
    <AppProviders>
      <App />
    </AppProviders>,
  );
}
