import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routes.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./providers/AuthProvider.jsx";
import SmoothScrollProvider from "./components/Shared/SmoothScrollProvider.jsx";
import { Toaster } from "react-hot-toast";
import ProductSearchProvider from "./providers/ProductSearchProvider.jsx";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductSearchProvider>
          {/* <SmoothScrollProvider> */}
            <RouterProvider router={router} />
          {/* </SmoothScrollProvider> */}
          <Toaster />
        </ProductSearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
