import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface LoginAttemptsProps {
  attempts: number;
  maxAttempts: number;
  isBlocked: boolean;
  blockEndTime: number;
}

export function LoginAttempts({ attempts, maxAttempts, isBlocked, blockEndTime }: LoginAttemptsProps) {
  const remainingAttempts = maxAttempts - attempts;
  const progress = (attempts / maxAttempts) * 100;

  const formatTimeRemaining = () => {
    const now = Date.now();
    const timeRemaining = Math.max(0, blockEndTime - now);
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isBlocked) {
    return (
      <Alert variant="destructive" className="mt-4">
        <div className="space-y-2">
          <p>Conta temporariamente bloqueada por excesso de tentativas.</p>
          <p className="text-sm">
            Tente novamente em: {formatTimeRemaining()}
          </p>
        </div>
      </Alert>
    );
  }

  if (attempts > 0) {
    return (
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Tentativas restantes: {remainingAttempts}
          </span>
          <span className={remainingAttempts <= 2 ? 'text-destructive' : 'text-muted-foreground'}>
            {remainingAttempts} de {maxAttempts}
          </span>
        </div>
        <Progress 
          value={progress} 
          className={remainingAttempts <= 2 ? 'bg-destructive' : ''}
        />
      </div>
    );
  }

  return null;
}
