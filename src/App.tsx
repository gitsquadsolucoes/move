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
import AnamneseSocial from "./pages/formularios/AnamneseSocial";
import FichaEvolucao from "./pages/formularios/FichaEvolucao";
import VisaoHolistica from "./pages/formularios/VisaoHolistica";
import RodaVida from "./pages/formularios/RodaVida";
import PlanoAcao from "./pages/formularios/PlanoAcao";
import TermoConsentimento from "./pages/formularios/TermoConsentimento";
import MatriculaProjetos from "./pages/formularios/MatriculaProjetos";
import DeclaracoesRecibos from "./pages/formularios/DeclaracoesRecibos";
import Analytics from "./pages/Analytics";
import Oficinas from "./pages/Oficinas";
import Feed from "./pages/Feed";
import Configuracoes from "./pages/Configuracoes";

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
            <Route path="/analytics" element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            } />
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
            <Route path="/beneficiarias/:beneficiariaId/anamnese" element={
              <ProtectedRoute>
                <MainLayout>
                  <AnamneseSocial />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/evolucao" element={
              <ProtectedRoute>
                <MainLayout>
                  <FichaEvolucao />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/visao-holistica" element={
              <ProtectedRoute>
                <MainLayout>
                  <VisaoHolistica />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/roda-vida" element={
              <ProtectedRoute>
                <MainLayout>
                  <RodaVida />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/plano-acao" element={
              <ProtectedRoute>
                <MainLayout>
                  <PlanoAcao />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/termo-consentimento" element={
              <ProtectedRoute>
                <MainLayout>
                  <TermoConsentimento />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/matricula-projetos" element={
              <ProtectedRoute>
                <MainLayout>
                  <MatriculaProjetos />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/:beneficiariaId/declaracoes-recibos" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeclaracoesRecibos />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/oficinas" element={
              <ProtectedRoute>
                <MainLayout>
                  <Oficinas />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/feed" element={
              <ProtectedRoute>
                <MainLayout>
                  <Feed />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <Configuracoes />
                </MainLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
