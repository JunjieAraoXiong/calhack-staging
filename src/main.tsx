import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App, { ArrivalErrorBoundary, SetupRequired } from "./App";
import "./styles.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const client = convexUrl ? new ConvexReactClient(convexUrl) : null;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {client ? (
      <ConvexProvider client={client}>
        <ArrivalErrorBoundary>
          <App />
        </ArrivalErrorBoundary>
      </ConvexProvider>
    ) : (
      <SetupRequired />
    )}
  </StrictMode>,
);
