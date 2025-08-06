import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Users, Shield, Key, Trash2, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
  tipo_usuario: 'admin' | 'profissional';
  data_criacao: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  module: string;
  permission: string;
  user_name: string;
}

const Configuracoes = () => {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const modules = [
    { value: 'beneficiarias', label: 'Beneficiárias' },
    { value: 'formularios', label: 'Formulários' },
    { value: 'oficinas', label: 'Oficinas' },
    { value: 'relatorios', label: 'Relatórios' },
    { value: 'usuarios', label: 'Usuários' },
    { value: 'sistema', label: 'Sistema' }
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