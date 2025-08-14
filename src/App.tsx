import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RecuperarSenha from "./pages/RecuperarSenha";
import Beneficiarias from "./pages/Beneficiarias";
import CadastroBeneficiaria from "./pages/CadastroBeneficiaria";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/main-layout";
import { PostgreSQLAuthProvider } from "./hooks/usePostgreSQLAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Analytics from "./pages/Analytics";
import Oficinas from "./pages/Oficinas";
import ParticipantesProjeto from "./pages/ParticipantesProjeto";
import Configuracoes from "./pages/ConfiguracoesNew";
import EditarPerfil from "./components/EditarPerfil";
import Mensagens from "./pages/Mensagens";
import Atividades from "./pages/Atividades";
import Feed from "./pages/Feed";
import Projetos from "./pages/Projetos";
import Relatorios from "./pages/Relatorios";
import FormularioWrapper from "./pages/Formulario";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <PostgreSQLAuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
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
            <Route path="/analytics" element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
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
            <Route path="/participantes" element={
              <ProtectedRoute>
                <MainLayout>
                  <ParticipantesProjeto />
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
            <Route path="/configuracoes/perfil" element={
              <ProtectedRoute>
                <MainLayout>
                  <EditarPerfil />
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
            <Route path="/atividades" element={
              <ProtectedRoute>
                <MainLayout>
                  <Atividades />
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
            <Route path="/projetos" element={
              <ProtectedRoute>
                <MainLayout>
                  <Projetos />
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
            <Route path="/formularios/:tipo" element={
              <ProtectedRoute>
                <MainLayout>
                  <FormularioWrapper />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PostgreSQLAuthProvider>
  </ErrorBoundary>
);

export default App;