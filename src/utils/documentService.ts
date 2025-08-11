import { api } from "@/lib/api";

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
    // In development with dummy Supabase config, generate a mock PDF
    if (import.meta.env.DEV && 
        (import.meta.env.VITE_SUPABASE_URL?.includes('dummy') || 
         import.meta.env.VITE_SUPABASE_ANON_KEY?.includes('dummy'))) {
      
      console.log('Generating mock document for development...', request);
      
      // Create a simple mock PDF content
      const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Documento Mock - ${request.documentType}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000208 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
304
%%EOF`;

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      return new Blob([mockPdfContent], { type: 'application/pdf' });
    }

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