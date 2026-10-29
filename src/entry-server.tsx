import { renderToString } from "react-dom/server";

import { App } from "@/app/App";
import { AppProviders } from "@/app/AppProviders";

export function render() {
  return renderToString(
    <AppProviders>
      <App />
    </AppProviders>,
  );
}
