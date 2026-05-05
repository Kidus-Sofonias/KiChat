import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import UserProvider from "./Context/UserProvider";
import { PreferencesProvider } from "./Context/PreferencesContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";

const pendingRouteRestore =
  typeof window !== "undefined" ? window.sessionStorage.getItem("kichat_spa_redirect") : null;

if (pendingRouteRestore) {
  window.sessionStorage.removeItem("kichat_spa_redirect");
  window.history.replaceState(null, "", pendingRouteRestore);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PreferencesProvider>
      <UserProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProvider>
    </PreferencesProvider>
  </React.StrictMode>
);
