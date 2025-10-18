import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routes.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./providers/AuthProvider.jsx";
import SmoothScrollProvider from "./components/Shared/SmoothScrollProvider.jsx";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScrollProvider>
          <RouterProvider router={router} />
        </SmoothScrollProvider>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
