import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateDocument, downloadDocument, getDocumentFilename, type DocumentType } from '@/utils/documentService';

interface DocumentDownloadButtonProps {
  documentType: DocumentType;
  beneficiariaId: string;
  beneficiariaNome: string;
  formId: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

export const DocumentDownloadButton: React.FC<DocumentDownloadButtonProps> = ({
  documentType,
  beneficiariaId,
  beneficiariaNome,
  formId,
  size = 'default',
  variant = 'outline',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const blob = await generateDocument({
        documentType,
        beneficiariaId,
        formId
      });

      const filename = getDocumentFilename(documentType, beneficiariaNome);
      downloadDocument(blob, filename);

      toast({
        title: "Documento gerado",
        description: "Download iniciado com sucesso",
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      size={size}
      variant={variant}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Gerar PDF
        </>
      )}
    </Button>
  );
};