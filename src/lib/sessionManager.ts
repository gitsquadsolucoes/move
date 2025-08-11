import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';

interface SessionData {
  user: any;
  profile: any;
  expiresAt: number;
}

class SessionManager {
  private static readonly SESSION_KEY = 'move_marias_session';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos
  private static refreshTimer?: NodeJS.Timeout;

  static saveSession(sessionData: SessionData) {
    try {
      const encryptedData = btoa(JSON.stringify(sessionData));
      Cookies.set(this.SESSION_KEY, encryptedData, {
        expires: 7, // 7 dias
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      logger.info('Sessão salva com sucesso');
    } catch (error) {
      logger.error('Erro ao salvar sessão', error);
    }
  }

  static getSession(): SessionData | null {
    try {
      const encryptedData = Cookies.get(this.SESSION_KEY);
      if (!encryptedData) return null;

      const sessionData = JSON.parse(atob(encryptedData));
      
      // Verifica se a sessão expirou
      if (Date.now() > sessionData.expiresAt) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      logger.error('Erro ao recuperar sessão', error);
      this.clearSession();
      return null;
    }
  }

  static clearSession() {
    Cookies.remove(this.SESSION_KEY);
    logger.info('Sessão removida');
  }

  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Erro ao renovar sessão', error);
        return false;
      }

      if (data.session) {
        const sessionData: SessionData = {
          user: data.session.user,
          profile: null, // Será carregado depois
          expiresAt: Date.now() + (data.session.expires_in! * 1000)
        };

        this.saveSession(sessionData);
        logger.info('Sessão renovada com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Erro ao renovar sessão', error);
      return false;
    }
  }

  static startAutoRefresh() {
    this.stopAutoRefresh();
    
    this.refreshTimer = setInterval(async () => {
      const session = this.getSession();
      if (!session) return;

      const timeUntilExpiry = session.expiresAt - Date.now();
      
      // Se faltam menos de 5 minutos para expirar, renovar
      if (timeUntilExpiry < this.REFRESH_THRESHOLD) {
        const success = await this.refreshSession();
        if (!success) {
          this.clearSession();
          window.location.href = '/auth';
        }
      }
    }, 60000); // Verifica a cada minuto
  }

  static stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }
}

// Hook para usar o gerenciador de sessão
export const useSessionManager = () => {
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      const session = SessionManager.getSession();
      
      if (session) {
        setIsSessionValid(true);
        SessionManager.startAutoRefresh();
      } else {
        // Tentar recuperar sessão do Supabase
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const sessionData: SessionData = {
            user: data.session.user,
            profile: null,
            expiresAt: Date.now() + (data.session.expires_in! * 1000)
          };
          
          SessionManager.saveSession(sessionData);
          setIsSessionValid(true);
          SessionManager.startAutoRefresh();
        }
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Cleanup ao desmontar
    return () => {
      SessionManager.stopAutoRefresh();
    };
  }, []);

  const logout = async () => {
    SessionManager.stopAutoRefresh();
    SessionManager.clearSession();
    await supabase.auth.signOut();
    setIsSessionValid(false);
    logger.info('Logout realizado');
  };

  const extendSession = () => {
    return SessionManager.refreshSession();
  };

  return {
    isSessionValid,
    isLoading,
    logout,
    extendSession,
    saveSession: SessionManager.saveSession,
    getSession: SessionManager.getSession,
  };
};

export { SessionManager };
