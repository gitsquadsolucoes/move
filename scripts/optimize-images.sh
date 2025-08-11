#!/bin/bash

# Script de otimização de imagens para produção
# Move Marias - Sistema de Gestão

echo "🖼️  Iniciando otimização de imagens..."

# Verificar se as ferramentas estão instaladas
check_tools() {
    echo "🔍 Verificando ferramentas necessárias..."
    
    if ! command -v pngquant &> /dev/null; then
        echo "⚠️  pngquant não encontrado. Instalando..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y pngquant
        elif command -v brew &> /dev/null; then
            brew install pngquant
        else
            echo "❌ Não foi possível instalar pngquant automaticamente"
            exit 1
        fi
    fi
    
    if ! command -v jpegoptim &> /dev/null; then
        echo "⚠️  jpegoptim não encontrado. Instalando..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y jpegoptim
        elif command -v brew &> /dev/null; then
            brew install jpegoptim
        else
            echo "❌ Não foi possível instalar jpegoptim automaticamente"
            exit 1
        fi
    fi
    
    echo "✅ Todas as ferramentas estão disponíveis"
}

# Função para otimizar PNGs
optimize_pngs() {
    echo "🎨 Otimizando arquivos PNG..."
    local count=0
    
    while IFS= read -r -d '' file; do
        echo "   Processando: $(basename "$file")"
        pngquant --force --ext .png --speed 1 --quality=65-80 "$file" 2>/dev/null
        ((count++))
    done < <(find "$IMAGE_DIR" -name "*.png" -print0)
    
    echo "   ✅ $count arquivos PNG otimizados"
}

# Função para otimizar JPEGs
optimize_jpegs() {
    echo "📷 Otimizando arquivos JPEG..."
    local count=0
    
    while IFS= read -r -d '' file; do
        echo "   Processando: $(basename "$file")"
        jpegoptim -m80 --strip-all "$file" 2>/dev/null
        ((count++))
    done < <(find "$IMAGE_DIR" -name "*.jpg" -o -name "*.jpeg" -print0)
    
    echo "   ✅ $count arquivos JPEG otimizados"
}

# Função para calcular economia de espaço
calculate_savings() {
    local before_size=$(du -sb "$IMAGE_DIR" | cut -f1)
    echo "📊 Estatísticas de otimização:"
    echo "   📁 Diretório: $IMAGE_DIR"
    echo "   💾 Tamanho final: $(du -sh "$IMAGE_DIR" | cut -f1)"
    echo "   📈 Arquivos PNG: $(find "$IMAGE_DIR" -name "*.png" | wc -l)"
    echo "   📈 Arquivos JPEG: $(find "$IMAGE_DIR" -name "*.jpg" -o -name "*.jpeg" | wc -l)"
}

# Configurações
IMAGE_DIR="${1:-public}"
BACKUP_DIR="${IMAGE_DIR}_backup_$(date +%Y%m%d_%H%M%S)"

# Verificar se o diretório existe
if [ ! -d "$IMAGE_DIR" ]; then
    echo "❌ Diretório $IMAGE_DIR não encontrado"
    exit 1
fi

# Criar backup antes da otimização
echo "💾 Criando backup em $BACKUP_DIR..."
cp -r "$IMAGE_DIR" "$BACKUP_DIR"

# Executar otimização
check_tools
optimize_pngs
optimize_jpegs
calculate_savings

echo ""
echo "🎉 Otimização concluída com sucesso!"
echo "📁 Backup disponível em: $BACKUP_DIR"
echo "💡 Para restaurar: rm -rf $IMAGE_DIR && mv $BACKUP_DIR $IMAGE_DIR"
echo ""
