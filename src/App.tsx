import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Beneficiarias from "./pages/Beneficiarias";
import CadastroBeneficiaria from "./pages/CadastroBeneficiaria";
import PAEDIBeneficiaria from "./pages/PAEDIBeneficiaria";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/main-layout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/beneficiarias" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Beneficiarias />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/beneficiarias/nova" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CadastroBeneficiaria />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/beneficiarias/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PAEDIBeneficiaria />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
