#!/bin/bash

# Script para migrar todos os arquivos do Supabase para PostgreSQL API

echo "🔄 Iniciando migração completa do Supabase para PostgreSQL..."

# Lista de arquivos para migração
FILES=(
    "src/pages/EditarBeneficiaria.tsx"
    "src/pages/CadastroBeneficiaria_NEW.tsx"
    "src/pages/ParticipantesProjeto.tsx"
    "src/pages/Mensagens.tsx"
    "src/pages/Configuracoes.tsx"
    "src/pages/Relatorios.tsx"
    "src/pages/Projetos.tsx"
    "src/pages/Feed.tsx"
    "src/pages/FeedNew.tsx"
    "src/pages/Analytics.tsx"
    "src/pages/FeedWithComments.tsx"
    "src/pages/Oficinas.tsx"
    "src/pages/PAEDIBeneficiaria.tsx"
    "src/pages/ConfiguracoesNew.tsx"
    "src/pages/Tarefas.tsx"
    "src/pages/CadastroBeneficiaria_FINAL.tsx"
    "src/hooks/useAuth.tsx"
    "src/lib/sessionManager.ts"
    "src/utils/documentService.ts"
    "src/components/NotificationCenter.tsx"
    "src/components/MessagingWidget.tsx"
    "src/components/MessagingSystem.tsx"
)

# Formulários
FORM_FILES=(
    "src/pages/formularios/TermoConsentimento.tsx"
    "src/pages/formularios/AnamneseSocial.tsx"
    "src/pages/formularios/FichaEvolucao.tsx"
    "src/pages/formularios/VisaoHolistica.tsx"
    "src/pages/formularios/DeclaracoesRecibos.tsx"
    "src/pages/formularios/PlanoAcao.tsx"
    "src/pages/formularios/MatriculaProjetos.tsx"
    "src/pages/formularios/RodaVida.tsx"
)

# Função para substituir imports do Supabase
replace_supabase_import() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "📝 Migrando: $file"
        sed -i "s|import { supabase } from '@/integrations/supabase/client';|import { api } from '@/lib/api';|g" "$file"
        sed -i "s|import { supabase } from \"@/integrations/supabase/client\";|import { api } from \"@/lib/api\";|g" "$file"
        echo "✅ Migrado: $file"
    else
        echo "⚠️  Arquivo não encontrado: $file"
    fi
}

# Migrar arquivos principais
for file in "${FILES[@]}"; do
    replace_supabase_import "$file"
done

# Migrar formulários
for file in "${FORM_FILES[@]}"; do
    replace_supabase_import "$file"
done

echo "🎯 Migração de imports concluída!"
echo "📋 Próximos passos manuais necessários:"
echo "  1. Substituir chamadas supabase.from() por api.get/post/put/delete()"
echo "  2. Atualizar tratamento de respostas (response.data)"
echo "  3. Remover dependências do Supabase Auth"
echo "  4. Testar funcionalidades migradas"

echo "✨ Script de migração finalizado!"
