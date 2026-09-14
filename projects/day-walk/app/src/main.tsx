import { createRoot } from "react-dom/client";
import "./theme/tokens.css";
import "./theme/app.css";
import "./theme/day-thirds.css";
import "./theme/polish.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
