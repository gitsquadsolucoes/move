import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import jsPDF from 'https://esm.sh/jspdf@2.5.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentType, beneficiariaId, formId } = await req.json();

    console.log(`Generating document: ${documentType} for beneficiaria: ${beneficiariaId}`);

    // Get beneficiaria data
    const { data: beneficiaria, error: beneficiariaError } = await supabaseClient
      .from('beneficiarias')
      .select('*')
      .eq('id', beneficiariaId)
      .single();

    if (beneficiariaError || !beneficiaria) {
      throw new Error('Beneficiária não encontrada');
    }

    let pdfBuffer: Uint8Array;

    switch (documentType) {
      case 'declaracao_comparecimento':
        pdfBuffer = await generateDeclaracaoComparecimento(supabaseClient, beneficiaria, formId);
        break;
      case 'anamnese_social':
        pdfBuffer = await generateAnamneseSocial(supabaseClient, beneficiaria, formId);
        break;
      case 'ficha_evolucao':
        pdfBuffer = await generateFichaEvolucao(supabaseClient, beneficiaria, formId);
        break;
      case 'termo_consentimento':
        pdfBuffer = await generateTermoConsentimento(supabaseClient, beneficiaria, formId);
        break;
      case 'visao_holistica':
        pdfBuffer = await generateVisaoHolistica(supabaseClient, beneficiaria, formId);
        break;
      case 'roda_vida':
        pdfBuffer = await generateRodaVida(supabaseClient, beneficiaria, formId);
        break;
      case 'plano_acao':
        pdfBuffer = await generatePlanoAcao(supabaseClient, beneficiaria, formId);
        break;
      case 'matricula_projetos':
        pdfBuffer = await generateMatriculaProjetos(supabaseClient, beneficiaria, formId);
        break;
      default:
        throw new Error('Tipo de documento não suportado');
    }

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documentType}_${beneficiaria.nome_completo.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateDeclaracaoComparecimento(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: declaracao } = await supabaseClient
    .from('declaracoes_comparecimento')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('DECLARAÇÃO DE COMPARECIMENTO', 105, 45, { align: 'center' });
  
  // Content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const dataComparecimento = new Date(declaracao.data_comparecimento).toLocaleDateString('pt-BR');
  const horaEntrada = declaracao.hora_entrada || 'N/A';
  const horaSaida = declaracao.hora_saida || 'N/A';
  
  const content = `
Declaro para os devidos fins que ${beneficiaria.nome_completo}, portador(a) do CPF nº ${beneficiaria.cpf}, compareceu ao Instituto Move Marias na data de ${dataComparecimento}.

Horário de entrada: ${horaEntrada}
Horário de saída: ${horaSaida}

Profissional responsável: ${declaracao.profissional_responsavel}

Esta declaração é emitida para comprovação de comparecimento às atividades do instituto.
  `;
  
  const splitContent = doc.splitTextToSize(content, 170);
  doc.text(splitContent, 20, 70);
  
  // Footer
  doc.setFontSize(10);
  doc.text(`Documento gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 250);
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateAnamneseSocial(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: anamnese } = await supabaseClient
    .from('anamneses_social')
    .select('*')
    .eq('id', formId)
    .single();

  const { data: membros } = await supabaseClient
    .from('membros_familia')
    .select('*')
    .eq('anamnese_id', formId);

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('ANAMNESE SOCIAL', 105, 35, { align: 'center' });
  
  // Beneficiaria info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${beneficiaria.nome_completo}`, 20, 55);
  doc.text(`CPF: ${beneficiaria.cpf}`, 20, 65);
  doc.text(`Data de Nascimento: ${new Date(beneficiaria.data_nascimento).toLocaleDateString('pt-BR')}`, 20, 75);
  
  let yPosition = 90;
  
  // Vulnerabilidades
  if (anamnese.vulnerabilidades && anamnese.vulnerabilidades.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Vulnerabilidades:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    anamnese.vulnerabilidades.forEach((vuln: string) => {
      doc.text(`• ${vuln}`, 25, yPosition);
      yPosition += 8;
    });
    yPosition += 5;
  }
  
  // Health conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Condições de Saúde:', 20, yPosition);
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  
  if (anamnese.doenca_cronica_degenerativa) {
    doc.text('• Doença crônica/degenerativa', 25, yPosition);
    if (anamnese.desafios_doenca) {
      doc.text(`  Desafios: ${anamnese.desafios_doenca}`, 30, yPosition + 8);
      yPosition += 8;
    }
    yPosition += 8;
  }
  
  if (anamnese.deficiencia) {
    doc.text('• Deficiência', 25, yPosition);
    if (anamnese.desafios_deficiencia) {
      doc.text(`  Desafios: ${anamnese.desafios_deficiencia}`, 30, yPosition + 8);
      yPosition += 8;
    }
    yPosition += 8;
  }
  
  // Family members
  if (membros && membros.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Membros da Família:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    
    membros.forEach((membro: any) => {
      doc.text(`• ${membro.nome} - Idade: ${membro.idade || 'N/A'} - Trabalha: ${membro.trabalha ? 'Sim' : 'Não'}`, 25, yPosition);
      if (membro.renda) {
        doc.text(`  Renda: R$ ${parseFloat(membro.renda).toFixed(2)}`, 30, yPosition + 8);
        yPosition += 8;
      }
      yPosition += 8;
    });
  }
  
  // Observations
  if (anamnese.observacoes_importantes) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Observações Importantes:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    const obs = doc.splitTextToSize(anamnese.observacoes_importantes, 170);
    doc.text(obs, 20, yPosition);
  }
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateFichaEvolucao(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: ficha } = await supabaseClient
    .from('fichas_evolucao')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('FICHA DE EVOLUÇÃO', 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${beneficiaria.nome_completo}`, 20, 55);
  doc.text(`Data da Evolução: ${new Date(ficha.data_evolucao).toLocaleDateString('pt-BR')}`, 20, 65);
  doc.text(`Responsável: ${ficha.responsavel}`, 20, 75);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Descrição da Evolução:', 20, 95);
  doc.setFont('helvetica', 'normal');
  
  const descricao = doc.splitTextToSize(ficha.descricao, 170);
  doc.text(descricao, 20, 105);
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateTermoConsentimento(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: termo } = await supabaseClient
    .from('termos_consentimento')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('TERMO DE CONSENTIMENTO', 105, 35, { align: 'center' });
  
  const content = `
Eu, ${beneficiaria.nome_completo}, portador(a) do CPF nº ${beneficiaria.cpf}, declaro ter sido informado(a) e concordo com os termos apresentados pelo Instituto Move Marias.

Data do Consentimento: ${new Date(termo.data_consentimento).toLocaleDateString('pt-BR')}
Nacionalidade: ${termo.nacionalidade || 'Não informada'}
Estado Civil: ${termo.estado_civil || 'Não informado'}

AUTORIZAÇÕES:

Tratamento de Dados: ${termo.tratamento_dados_autorizado ? 'AUTORIZADO' : 'NÃO AUTORIZADO'}
Uso de Imagem: ${termo.uso_imagem_autorizado ? 'AUTORIZADO' : 'NÃO AUTORIZADO'}

Este termo garante que a beneficiária foi devidamente informada sobre o tratamento de seus dados pessoais e uso de imagem, em conformidade com a Lei Geral de Proteção de Dados (LGPD).

Assinatura da Voluntária: ${termo.assinatura_voluntaria ? 'SIM' : 'NÃO'}
Assinatura do Responsável Familiar: ${termo.assinatura_responsavel_familiar ? 'SIM' : 'NÃO'}
  `;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const splitContent = doc.splitTextToSize(content, 170);
  doc.text(splitContent, 20, 55);
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateVisaoHolistica(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: visao } = await supabaseClient
    .from('visoes_holisticas')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('VISÃO HOLÍSTICA', 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${beneficiaria.nome_completo}`, 20, 55);
  doc.text(`Data: ${new Date(visao.data_visao).toLocaleDateString('pt-BR')}`, 20, 65);
  
  let yPosition = 80;
  
  if (visao.historia_vida) {
    doc.setFont('helvetica', 'bold');
    doc.text('História de Vida:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    const historia = doc.splitTextToSize(visao.historia_vida, 170);
    doc.text(historia, 20, yPosition);
    yPosition += historia.length * 5 + 10;
  }
  
  if (visao.rede_apoio) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Rede de Apoio:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    const rede = doc.splitTextToSize(visao.rede_apoio, 170);
    doc.text(rede, 20, yPosition);
    yPosition += rede.length * 5 + 10;
  }
  
  if (visao.visao_tecnica_referencia) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Visão Técnica de Referência:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    const visaoTecnica = doc.splitTextToSize(visao.visao_tecnica_referencia, 170);
    doc.text(visaoTecnica, 20, yPosition);
  }
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateRodaVida(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: roda } = await supabaseClient
    .from('roda_vida')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('RODA DA VIDA', 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${beneficiaria.nome_completo}`, 20, 55);
  doc.text(`Data: ${new Date(roda.data_roda).toLocaleDateString('pt-BR')}`, 20, 65);
  
  const areas = [
    { nome: 'Saúde', score: roda.saude_score },
    { nome: 'Relacionamento Familiar', score: roda.relacionamento_familiar_score },
    { nome: 'Vida Social', score: roda.vida_social_score },
    { nome: 'Equilíbrio Emocional', score: roda.equilibrio_emocional_score },
    { nome: 'Lazer', score: roda.lazer_score },
    { nome: 'Espiritualidade', score: roda.espiritualidade_score },
    { nome: 'Recursos Financeiros', score: roda.recursos_financeiros_score },
    { nome: 'Amor', score: roda.amor_score },
    { nome: 'Contribuição Social', score: roda.contribuicao_social_score },
    { nome: 'Propósito', score: roda.proposito_score }
  ];
  
  doc.setFont('helvetica', 'bold');
  doc.text('Avaliação das Áreas da Vida (1-10):', 20, 85);
  
  let yPosition = 100;
  doc.setFont('helvetica', 'normal');
  
  areas.forEach(area => {
    if (area.score !== null) {
      doc.text(`${area.nome}: ${area.score}/10`, 25, yPosition);
      yPosition += 10;
    }
  });
  
  // Calculate average
  const validScores = areas.filter(area => area.score !== null).map(area => area.score);
  if (validScores.length > 0) {
    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Média Geral: ${average.toFixed(1)}/10`, 25, yPosition);
  }
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generatePlanoAcao(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: plano } = await supabaseClient
    .from('planos_acao')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Construindo Passos para', 105, 20, { align: 'center' });
  doc.text('Minha Transformação', 105, 30, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('PLANO DE AÇÃO', 105, 45, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const subtitle = 'Avalie os passos essenciais para alcançar seus objetivos e promover equilíbrio em sua jornada.';
  const subtitleLines = doc.splitTextToSize(subtitle, 170);
  doc.text(subtitleLines, 105, 55, { align: 'center' });
  
  let yPosition = 70;
  
  // Beneficiary info and date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome da Beneficiária: ${beneficiaria.nome_completo}`, 20, yPosition);
  
  const dataPlano = plano.data_plano ? new Date(plano.data_plano).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
  doc.text(`Data: ${dataPlano}`, 20, yPosition + 10);
  
  yPosition += 25;
  
  // 1. Objetivo Principal
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Objetivo Principal:', 20, yPosition);
  
  if (plano.objetivo_principal) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const objetivoLines = doc.splitTextToSize(plano.objetivo_principal, 170);
    doc.text(objetivoLines, 20, yPosition + 8);
    yPosition += 8 + (objetivoLines.length * 5) + 10;
  } else {
    yPosition += 20;
  }
  
  // 2. Áreas Prioritárias
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Áreas Prioritárias:', 20, yPosition);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;
  
  const areas = plano.areas_prioritarias || {};
  const areaLabels = {
    autoconhecimento: 'Autoconhecimento',
    qualificacao: 'Qualificação',
    empreendedorismo: 'Empreendedorismo',
    apoio_social: 'Apoio Social/Assistência'
  };
  
  Object.entries(areaLabels).forEach(([key, label]) => {
    const checked = areas[key] ? '☑' : '☐';
    doc.text(`${checked} ${label}`, 25, yPosition);
    yPosition += 6;
  });
  
  if (areas.outras) {
    const outrasText = plano.outras_areas ? `☑ Outras: ${plano.outras_areas}` : '☑ Outras:';
    doc.text(outrasText, 25, yPosition);
    yPosition += 6;
  } else {
    doc.text('☐ Outras:', 25, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // 3. Ações a Serem Realizadas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Ações a Serem Realizadas:', 20, yPosition);
  
  if (plano.acoes_realizadas) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const acoesLines = doc.splitTextToSize(plano.acoes_realizadas, 170);
    doc.text(acoesLines, 20, yPosition + 8);
    yPosition += 8 + (acoesLines.length * 5) + 10;
  } else {
    yPosition += 20;
  }
  
  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  // 4. Suporte oferecido pelo instituto
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Suporte oferecido pelo instituto:', 20, yPosition);
  
  if (plano.suporte_instituto) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const suporteLines = doc.splitTextToSize(plano.suporte_instituto, 170);
    doc.text(suporteLines, 20, yPosition + 8);
    yPosition += 8 + (suporteLines.length * 5) + 15;
  } else {
    yPosition += 25;
  }
  
  // 5. Avaliação e Reavaliação
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Avaliação e Reavaliação (Semestral)', 20, yPosition);
  yPosition += 15;
  
  // Primeira Avaliação
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const primeiraData = plano.primeira_avaliacao_data ? 
    new Date(plano.primeira_avaliacao_data).toLocaleDateString('pt-BR') : '___/___/___';
  doc.text(`Primeira Avaliação: ${primeiraData}`, 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Revisão do progresso nas áreas de:', 20, yPosition);
  yPosition += 6;
  
  if (plano.primeira_avaliacao_progresso) {
    const primeiraProgressoLines = doc.splitTextToSize(plano.primeira_avaliacao_progresso, 170);
    doc.text(primeiraProgressoLines, 20, yPosition);
    yPosition += (primeiraProgressoLines.length * 5) + 10;
  } else {
    yPosition += 15;
  }
  
  // Segunda Avaliação
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const segundaData = plano.segunda_avaliacao_data ? 
    new Date(plano.segunda_avaliacao_data).toLocaleDateString('pt-BR') : '___/___/___';
  doc.text(`Segunda Avaliação: ${segundaData}`, 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Revisão do progresso nas áreas de:', 20, yPosition);
  yPosition += 6;
  
  if (plano.segunda_avaliacao_progresso) {
    const segundaProgressoLines = doc.splitTextToSize(plano.segunda_avaliacao_progresso, 170);
    doc.text(segundaProgressoLines, 20, yPosition);
    yPosition += (segundaProgressoLines.length * 5) + 15;
  } else {
    yPosition += 20;
  }
  
  // Assinaturas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Assinaturas:', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const beneficiariaStatus = plano.assinatura_beneficiaria ? '[ASSINADO]' : '';
  doc.text(`Beneficiária: ${beneficiariaStatus}`, 20, yPosition);
  doc.text('_______________________________________', 20, yPosition + 5);
  yPosition += 20;
  
  const responsavelStatus = plano.assinatura_responsavel_tecnico ? '[ASSINADO]' : '';
  doc.text(`Responsável Técnico: ${responsavelStatus}`, 20, yPosition);
  doc.text('_______________________________________', 20, yPosition + 5);
  
  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateMatriculaProjetos(supabaseClient: any, beneficiaria: any, formId: string): Promise<Uint8Array> {
  const { data: matricula } = await supabaseClient
    .from('matriculas_projetos')
    .select('*')
    .eq('id', formId)
    .single();

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTO MOVE MARIAS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('MATRÍCULA EM PROJETOS', 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${beneficiaria.nome_completo}`, 20, 55);
  doc.text(`Projeto: ${matricula.nome_projeto}`, 20, 65);
  doc.text(`Data de Início: ${new Date(matricula.data_inicio_projeto).toLocaleDateString('pt-BR')}`, 20, 75);
  
  if (matricula.data_termino_projeto) {
    doc.text(`Data de Término: ${new Date(matricula.data_termino_projeto).toLocaleDateString('pt-BR')}`, 20, 85);
  }
  
  let yPosition = 105;
  
  if (matricula.carga_horaria) {
    doc.text(`Carga Horária: ${matricula.carga_horaria}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (matricula.escolaridade) {
    doc.text(`Escolaridade: ${matricula.escolaridade}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (matricula.profissao) {
    doc.text(`Profissão: ${matricula.profissao}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (matricula.renda_familiar) {
    doc.text(`Renda Familiar: R$ ${parseFloat(matricula.renda_familiar).toFixed(2)}`, 20, yPosition);
    yPosition += 10;
  }
  
  if (matricula.observacoes_matricula) {
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    const obs = doc.splitTextToSize(matricula.observacoes_matricula, 170);
    doc.text(obs, 20, yPosition);
  }
  
  return new Uint8Array(doc.output('arraybuffer'));
}