import { Progress } from "@/components/ui/progress";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    if (!password) {
      return { score: 0, feedback: ['Digite uma senha'] };
    }

    // Comprimento
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('A senha deve ter pelo menos 8 caracteres');
    }

    // Letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Adicione letras maiúsculas');
    }

    // Letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Adicione letras minúsculas');
    }

    // Números
    if (/[0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Adicione números');
    }

    // Caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Adicione caracteres especiais');
    }

    return { score, feedback };
  };

  const { score, feedback } = calculateStrength(password);

  const getStrengthColor = () => {
    if (score <= 20) return 'bg-destructive';
    if (score <= 40) return 'bg-orange-500';
    if (score <= 60) return 'bg-yellow-500';
    if (score <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (score <= 20) return 'Muito fraca';
    if (score <= 40) return 'Fraca';
    if (score <= 60) return 'Média';
    if (score <= 80) return 'Forte';
    return 'Muito forte';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Força da senha:</span>
        <span className={score > 60 ? 'text-green-500' : 'text-muted-foreground'}>
          {getStrengthText()}
        </span>
      </div>
      <Progress value={score} className={getStrengthColor()} />
      {feedback.length > 0 && score < 100 && (
        <ul className="text-sm text-muted-foreground list-disc pl-4 pt-2">
          {feedback.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
