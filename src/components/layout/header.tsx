import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/usePostgreSQLAuth";
import { UserProfileButton } from "@/components/user/UserProfileButton";
import NotificationCenterSimple from "@/components/NotificationCenterSimple";

export default function Header() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Move Marias Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <h2 className="text-lg font-semibold text-foreground md:block hidden">
          Sistema de Gestão - Instituto Move Marias
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationCenterSimple />
        <UserProfileButton />
      </div>
    </header>
  );
}