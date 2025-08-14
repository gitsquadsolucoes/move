import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

type FormularioTipo = 
  | 'declaracao' 
  | 'recibo' 
  | 'anamnese' 
  | 'evolucao' 
  | 'termo' 
  | 'visao' 
  | 'roda-vida' 
  | 'plano' 
  | 'matricula';

interface FormularioProps {
  tipo: FormularioTipo;
}

const titulos: Record<FormularioTipo, string> = {
  declaracao: 'Declaração de Comparecimento',
  recibo: 'Recibo de Benefício',
  anamnese: 'Anamnese Social',
  evolucao: 'Ficha de Evolução',
  termo: 'Termo de Consentimento',
  visao: 'Visão Holística',
  'roda-vida': 'Roda da Vida',
  plano: 'Plano de Ação',
  matricula: 'Matrícula de Projetos',
};

export function Formulario({ tipo }: FormularioProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const response = await api.getFormulario(tipo);
        if (response.success) {
          setDados(response.data);
        } else {
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar o formulário.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar o formulário.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [tipo, toast]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{titulos[tipo]}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {/* Aqui vai o conteúdo específico de cada formulário */}
              <div className="text-center">
                Formulário em desenvolvimento...
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Voltar
                </Button>
                <Button>Salvar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper que pega o tipo do formulário da URL
export default function FormularioWrapper() {
  const { tipo } = useParams<{ tipo: FormularioTipo }>();
  const navigate = useNavigate();

  if (!tipo || !Object.keys(titulos).includes(tipo)) {
    navigate('/404');
    return null;
  }

  return <Formulario tipo={tipo as FormularioTipo} />;
}
