  \
  import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  Users, 
  Shield, 
  Key, 
  Trash2, 
  Plus, 
  Edit, 
  User,
  Camera,
  Save,
  Download,
  FileText,
  Database,
  Server,
  Palette,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  foto_url?: string;
  bio?: string;
  tipo_usuario: 'super_admin' | 'admin' | 'coordenador' | 'profissional' | 'assistente';
  ativo: boolean;
  data_criacao: string;
  ultimo_acesso?: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  module: string;
  permission: 'read' | 'write' | 'admin';
  user_name: string;
}

interface SystemConfig {
  id: string;
  chave: string;
  valor: string;
  descricao: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
}

// Mock data para desenvolvimento
const mockUsers: UserProfile[] = [
  {
    id: '1',
    user_id: '1',
    nome_completo: 'Ana Silva Santos',
    email: 'ana.santos@movemarias.org',
    telefone: '(11) 99999-1111',
    cargo: 'Coordenadora Geral',
    departamento: 'Coordenação',
    foto_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b526?w=400',
    bio: 'Coordenadora com 8 anos de experiência em projetos sociais.',
    tipo_usuario: 'super_admin',
    ativo: true,
    data_criacao: '2024-01-01',
    ultimo_acesso: '2024-08-07'
  },
  {
    id: '2',
    user_id: '2',
    nome_completo: 'Maria Oliveira',
    email: 'maria.oliveira@movemarias.org',
    telefone: '(11) 99999-2222',
    cargo: 'Assistente Social',
    departamento: 'Atendimento',
    foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Assistente social especializada em acompanhamento familiar.',
    tipo_usuario: 'profissional',
    ativo: true,
    data_criacao: '2024-02-01',
    ultimo_acesso: '2024-08-06'
  },
  {
    id: '3',
    user_id: '3',
    nome_completo: 'Carlos Roberto',
    email: 'carlos.roberto@movemarias.org',
    telefone: '(11) 99999-3333',
    cargo: 'Coordenador de Projetos',
    departamento: 'Projetos',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Responsável pela gestão e coordenação de projetos sociais.',
    tipo_usuario: 'coordenador',
    ativo: true,
    data_criacao: '2024-03-01',
    ultimo_acesso: '2024-08-05'
  }
];

const mockPermissions: UserPermission[] = [
  { id: '1', user_id: '1', module: 'beneficiarias', permission: 'admin', user_name: 'Ana Silva Santos' },
  { id: '2', user_id: '1', module: 'oficinas', permission: 'admin', user_name: 'Ana Silva Santos' },
  { id: '3', user_id: '1', module: 'projetos', permission: 'admin', user_name: 'Ana Silva Santos' },
  { id: '4', user_id: '1', module: 'usuarios', permission: 'admin', user_name: 'Ana Silva Santos' },
  { id: '5', user_id: '2', module: 'beneficiarias', permission: 'write', user_name: 'Maria Oliveira' },
  { id: '6', user_id: '2', module: 'formularios', permission: 'write', user_name: 'Maria Oliveira' },
  { id: '7', user_id: '3', module: 'oficinas', permission: 'admin', user_name: 'Carlos Roberto' },
  { id: '8', user_id: '3', module: 'projetos', permission: 'admin', user_name: 'Carlos Roberto' }
];

const mockSystemConfig: SystemConfig[] = [
  { id: '1', chave: 'nome_organizacao', valor: 'Move Marias', descricao: 'Nome da organização', tipo: 'string' },
  { id: '2', chave: 'email_organizacao', valor: 'contato@movemarias.org', descricao: 'Email oficial', tipo: 'string' },
  { id: '3', chave: 'telefone_organizacao', valor: '(11) 3333-4444', descricao: 'Telefone oficial', tipo: 'string' },
  { id: '4', chave: 'endereco_organizacao', valor: 'Rua das Flores, 123', descricao: 'Endereço da sede', tipo: 'string' },
  { id: '5', chave: 'max_beneficiarias', valor: '1000', descricao: 'Máximo de beneficiárias', tipo: 'number' },
  { id: '6', chave: 'backup_automatico', valor: 'true', descricao: 'Backup automático habilitado', tipo: 'boolean' },
  { id: '7', chave: 'notificacoes_email', valor: 'true', descricao: 'Notificações por email', tipo: 'boolean' }
];

const modules = [
  { value: 'beneficiarias', label: 'Beneficiárias', icon: Users },
  { value: 'formularios', label: 'Formulários', icon: FileText },
  { value: 'oficinas', label: 'Oficinas', icon: Users },
  { value: 'projetos', label: 'Projetos', icon: Users },
  { value: 'relatorios', label: 'Relatórios', icon: FileText },
  { value: 'usuarios', label: 'Usuários', icon: Users },
  { value: 'configuracoes', label: 'Configurações', icon: Settings }
];
  ];

  const permissionTypes = [
    { value: 'read', label: 'Visualizar' },
    { value: 'write', label: 'Editar' },
    { value: 'delete', label: 'Excluir' },
    { value: 'admin', label: 'Administrar' }
  ];

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    }
  };

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('id, user_id, module, permission');

      if (error) throw error;
      
      // Get user names separately
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id, nome_completo')
        .in('user_id', userIds);

      const usersMap = new Map(users?.map(u => [u.user_id, u.nome_completo]) || []);

      setPermissions(data?.map(p => ({
        id: p.id,
        user_id: p.user_id,
        module: p.module,
        permission: p.permission,
        user_name: usersMap.get(p.user_id) || 'Usuário'
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      Promise.all([loadUsers(), loadPermissions()]).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const updateUserType = async (userId: string, newType: 'admin' | 'profissional') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tipo_usuario: newType })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Tipo de usuário atualizado!" });
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive",
      });
    }
  };

  const addPermission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const permission = {
      user_id: formData.get('user_id') as string,
      module: formData.get('module') as any,
      permission: formData.get('permission') as any,
      created_by: profile?.user_id
    };

    try {
      const { error } = await supabase
        .from('user_permissions')
        .insert([permission]);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Permissão adicionada!" });
      setShowPermissionForm(false);
      loadPermissions();
    } catch (error) {
      console.error('Erro ao adicionar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar permissão",
        variant: "destructive",
      });
    }
  };

  const removePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Permissão removida!" });
      loadPermissions();
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover permissão",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Acesso negado. Apenas administradores podem acessar as configurações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Carregando configurações...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie usuários, permissões e configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Usuários</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Convidar Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.nome_completo}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={user.tipo_usuario === 'admin' ? 'default' : 'secondary'}>
                        {user.tipo_usuario === 'admin' ? 'Administrador' : 'Profissional'}
                      </Badge>
                      {user.user_id !== profile?.user_id && (
                        <Select
                          value={user.tipo_usuario}
                          onValueChange={(value: 'admin' | 'profissional') => 
                            updateUserType(user.user_id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="profissional">Profissional</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Permissões Específicas</CardTitle>
                <Dialog open={showPermissionForm} onOpenChange={setShowPermissionForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Permissão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Permissão</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={addPermission} className="space-y-4">
                      <div>
                        <Label htmlFor="user_id">Usuário</Label>
                        <Select name="user_id" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um usuário" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.user_id} value={user.user_id}>
                                {user.nome_completo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="module">Módulo</Label>
                        <Select name="module" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map((module) => (
                              <SelectItem key={module.value} value={module.value}>
                                {module.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="permission">Permissão</Label>
                        <Select name="permission" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma permissão" />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionTypes.map((perm) => (
                              <SelectItem key={perm.value} value={perm.value}>
                                {perm.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowPermissionForm(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Adicionar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {permissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma permissão específica configurada
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Key className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">{permission.user_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {modules.find(m => m.value === permission.module)?.label} - {' '}
                            {permissionTypes.find(p => p.value === permission.permission)?.label}
                          </p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Permissão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover esta permissão? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removePermission(permission.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações de Aniversário</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações automáticas de aniversário das beneficiárias
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automático dos dados diariamente
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo Manutenção</p>
                    <p className="text-sm text-muted-foreground">
                      Desabilitar acesso ao sistema para manutenção
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Ações do Sistema</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Exportar Dados do Sistema
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Limpar Cache do Sistema
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Verificar Integridade dos Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;