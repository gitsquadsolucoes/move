import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Beneficiarias from "./pages/Beneficiarias";
import CadastroBeneficiaria from "./pages/CadastroBeneficiaria";
import EditarBeneficiaria from "./pages/EditarBeneficiaria";
import PAEDIBeneficiaria from "./pages/PAEDIBeneficiaria";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/main-layout";
import AuthProvider from "./hooks/useAuth";
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
import Projetos from "./pages/Projetos";
import ParticipantesProjeto from "./pages/ParticipantesProjeto";
import Feed from "./pages/FeedWithComments";
import Configuracoes from "./pages/ConfiguracoesNew";
import EditarPerfil from "./components/EditarPerfil";
import Mensagens from "./pages/Mensagens";
import Relatorios from "./pages/Relatorios";
import Atividades from "./pages/Atividades";
import Tarefas from "./pages/Tarefas";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias" element={
              <ProtectedRoute>
                <MainLayout>
                  <Beneficiarias />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/beneficiarias/nova" element={
              <ProtectedRoute>
                <MainLayout>
                  <CadastroBeneficiaria />
                </MainLayout>
              </ProtectedRoute>
            } />
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
            <Route 
              path="/beneficiarias/:beneficiariaId/editar" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditarBeneficiaria />
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
            <Route path="/oficinas" element={
              <ProtectedRoute>
                <MainLayout>
                  <Oficinas />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/projetos" element={
              <ProtectedRoute>
                <MainLayout>
                  <Projetos />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/projetos/:projetoId/participantes" element={
              <ProtectedRoute>
                <MainLayout>
                  <ParticipantesProjeto />
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
            <Route path="/mensagens" element={
              <ProtectedRoute>
                <MainLayout>
                  <Mensagens />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <MainLayout>
                  <Relatorios />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/atividades" element={
              <ProtectedRoute>
                <MainLayout>
                  <Atividades />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tarefas" element={
              <ProtectedRoute>
                <MainLayout>
                  <Tarefas />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <MainLayout>
                  <Configuracoes />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/perfil/editar" element={
              <ProtectedRoute>
                <MainLayout>
                  <EditarPerfil />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            } />
            {/* Formularios routes */}
            <Route path="/formularios/declaracao" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeclaracoesRecibos />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/recibo" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeclaracoesRecibos />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/anamnese" element={
              <ProtectedRoute>
                <MainLayout>
                  <AnamneseSocial />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/evolucao" element={
              <ProtectedRoute>
                <MainLayout>
                  <FichaEvolucao />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/termo" element={
              <ProtectedRoute>
                <MainLayout>
                  <TermoConsentimento />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/visao" element={
              <ProtectedRoute>
                <MainLayout>
                  <VisaoHolistica />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/roda-vida" element={
              <ProtectedRoute>
                <MainLayout>
                  <RodaVida />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/plano" element={
              <ProtectedRoute>
                <MainLayout>
                  <PlanoAcao />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/formularios/matricula" element={
              <ProtectedRoute>
                <MainLayout>
                  <MatriculaProjetos />
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
  </ErrorBoundary>
);

export default App;
