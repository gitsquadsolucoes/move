import { useState } from 'react';

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function usePasswordValidation() {
  const [attempts, setAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(0);

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos em milissegundos
  const MIN_ATTEMPT_INTERVAL = 2000; // 2 segundos entre tentativas

  const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const checkRateLimit = (): { canAttempt: boolean; timeToWait: number } => {
    const now = Date.now();

    // Se estiver bloqueado, verifica se já pode tentar novamente
    if (isBlocked) {
      if (now >= blockEndTime) {
        setIsBlocked(false);
        setAttempts(0);
        return { canAttempt: true, timeToWait: 0 };
      }
      return { canAttempt: false, timeToWait: blockEndTime - now };
    }

    // Verifica o intervalo mínimo entre tentativas
    if (now - lastAttemptTime < MIN_ATTEMPT_INTERVAL) {
      return { canAttempt: false, timeToWait: MIN_ATTEMPT_INTERVAL - (now - lastAttemptTime) };
    }

    // Incrementa tentativas e verifica se deve bloquear
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setLastAttemptTime(now);

    if (newAttempts >= MAX_ATTEMPTS) {
      setIsBlocked(true);
      const endTime = now + BLOCK_DURATION;
      setBlockEndTime(endTime);
      return { canAttempt: false, timeToWait: BLOCK_DURATION };
    }

    return { canAttempt: true, timeToWait: 0 };
  };

  const resetAttempts = () => {
    setAttempts(0);
    setIsBlocked(false);
    setBlockEndTime(0);
  };

  return {
    validatePassword,
    checkRateLimit,
    resetAttempts,
    attempts,
    isBlocked,
    blockEndTime
  };
}
