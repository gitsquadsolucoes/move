type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, Set<EventCallback>>;
  private maxListeners: number;

  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  public setMaxListeners(n: number): void {
    if (n < 0) {
      throw new Error('maxListeners must be a positive number');
    }
    this.maxListeners = n;
  }

  public on(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    const listeners = this.events.get(eventName)!;

    if (listeners.size >= this.maxListeners) {
      console.warn(
        `Warning: Possible EventEmitter memory leak detected. ${listeners.size} ${eventName} listeners added. ` +
        'Use emitter.setMaxListeners() to increase limit'
      );
    }

    listeners.add(callback);

    // Retorna uma função para remover o listener
    return () => this.off(eventName, callback);
  }

  public once(eventName: string, callback: EventCallback): () => void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(eventName, wrapper);
    };

    return this.on(eventName, wrapper);
  }

  public off(eventName: string, callback: EventCallback): void {
    const listeners = this.events.get(eventName);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.events.delete(eventName);
      }
    }
  }

  public emit(eventName: string, ...args: any[]): boolean {
    const listeners = this.events.get(eventName);
    if (!listeners) {
      return false;
    }

    listeners.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });

    return true;
  }

  public removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  public listenerCount(eventName: string): number {
    const listeners = this.events.get(eventName);
    return listeners ? listeners.size : 0;
  }

  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
