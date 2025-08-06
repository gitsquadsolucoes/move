import { supabase } from "@/integrations/supabase/client";

export type DocumentType = 
  | 'declaracao_comparecimento'
  | 'anamnese_social'
  | 'ficha_evolucao'
  | 'termo_consentimento'
  | 'visao_holistica'
  | 'roda_vida'
  | 'plano_acao'
  | 'matricula_projetos';

export interface GenerateDocumentRequest {
  documentType: DocumentType;
  beneficiariaId: string;
  formId: string;
}

export const generateDocument = async (request: GenerateDocumentRequest): Promise<Blob> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-document', {
      body: request,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw error;
    }

    // The edge function returns the PDF as binary data
    if (data instanceof ArrayBuffer) {
      return new Blob([data], { type: 'application/pdf' });
    }

    // Handle case where data might be a response object
    if (data && typeof data === 'object' && data.error) {
      throw new Error(data.error);
    }

    throw new Error('Unexpected response format from document generation service');
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};

export const downloadDocument = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getDocumentFilename = (documentType: DocumentType, beneficiariaNome: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanName = beneficiariaNome.replace(/\s+/g, '_');
  
  const documentNames = {
    declaracao_comparecimento: 'Declaracao_Comparecimento',
    anamnese_social: 'Anamnese_Social',
    ficha_evolucao: 'Ficha_Evolucao',
    termo_consentimento: 'Termo_Consentimento',
    visao_holistica: 'Visao_Holistica',
    roda_vida: 'Roda_da_Vida',
    plano_acao: 'Plano_de_Acao',
    matricula_projetos: 'Matricula_Projetos'
  };
  
  return `${documentNames[documentType]}_${cleanName}_${timestamp}.pdf`;
};