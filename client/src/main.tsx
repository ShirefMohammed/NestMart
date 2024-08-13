import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import "./css/adminDashboard.css";
import "./index.css";
import { store } from "./store/store.js";

// Disable React Dev Tools in Production
if (import.meta.env.VITE_NODE_ENV === "production") {
  disableReactDevTools();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
