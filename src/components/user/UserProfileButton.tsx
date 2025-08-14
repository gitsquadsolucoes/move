import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/usePostgreSQLAuth"
import { signOut } from "@/lib/auth"

interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  foto_url?: string;
  tipo_usuario: 'admin' | 'super_admin' | 'profissional';
}

export function UserProfileButton() {
  const { user } = useAuth()

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/auth'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.foto_url ? (
              <AvatarImage src={user.foto_url} alt={user.nome_completo} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.nome_completo || 'Usuário')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.nome_completo}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.tipo_usuario !== 'profissional' ? "default" : "secondary"} className="text-xs">
                {user.tipo_usuario !== 'profissional' ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.tipo_usuario === 'super_admin' ? 'Super Admin' : 'Administrador'}
                  </>
                ) : (
                  'Profissional'
                )}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/perfil'}>
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
