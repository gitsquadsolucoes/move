import { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface EventEmitterContextType {
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
  off: (event: string, callback: (data: any) => void) => void;
}

const EventEmitterContext = createContext<EventEmitterContextType | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

export const EventEmitterProvider = ({ children }: Props) => {
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const emit = (event: string, data: any) => {
    const eventListeners = listeners.current.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set());
    }
    listeners.current.get(event)?.add(callback);

    return () => off(event, callback);
  };

  const off = (event: string, callback: (data: any) => void) => {
    const eventListeners = listeners.current.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        listeners.current.delete(event);
      }
    }
  };

  return (
    <EventEmitterContext.Provider value={{ emit, on, off }}>
      {children}
    </EventEmitterContext.Provider>
  );
};

export const useEventEmitter = () => {
  const context = useContext(EventEmitterContext);
  if (!context) {
    throw new Error('useEventEmitter must be used within EventEmitterProvider');
  }
  return context;
};
