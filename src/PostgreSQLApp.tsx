import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import PostgreSQLAuth from "./pages/PostgreSQLAuth";
import PostgreSQLBeneficiarias from "./pages/PostgreSQLBeneficiarias";
import PostgreSQLCadastroBeneficiaria from "./pages/PostgreSQLCadastroBeneficiaria";
import EditarBeneficiaria from "./pages/EditarBeneficiaria";
import PAEDIBeneficiaria from "./pages/PAEDIBeneficiaria";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/main-layout";
import { PostgreSQLAuthProvider } from "./hooks/usePostgreSQLAuth";
import { PostgreSQLProtectedRoute } from "./components/auth/PostgreSQLProtectedRoute";
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

const PostgreSQLApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PostgreSQLAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<PostgreSQLAuth />} />
            <Route path="/" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Index />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <PostgreSQLBeneficiarias />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/nova" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <PostgreSQLCadastroBeneficiaria />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/editar" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <EditarBeneficiaria />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/paedi" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <PAEDIBeneficiaria />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/anamnese-social" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <AnamneseSocial />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/ficha-evolucao" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <FichaEvolucao />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/visao-holistica" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <VisaoHolistica />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/roda-vida" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <RodaVida />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/plano-acao" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <PlanoAcao />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/termo-consentimento" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <TermoConsentimento />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/matricula-projetos" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <MatriculaProjetos />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/beneficiarias/:id/formularios/declaracoes-recibos" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <DeclaracoesRecibos />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/analytics" element={
              <PostgreSQLProtectedRoute adminOnly>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/oficinas" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Oficinas />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/projetos" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Projetos />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/projetos/:id/participantes" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <ParticipantesProjeto />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/feed" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Feed />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Configuracoes />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/perfil" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <EditarPerfil />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/mensagens" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Mensagens />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Relatorios />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/atividades" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Atividades />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="/tarefas" element={
              <PostgreSQLProtectedRoute>
                <MainLayout>
                  <Tarefas />
                </MainLayout>
              </PostgreSQLProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </PostgreSQLAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default PostgreSQLApp;
