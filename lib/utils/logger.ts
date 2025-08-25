// =====================================================
// 🎯 LOGGER MÍNIMO - ELEVEN RIFAS
// =====================================================
// Logger simplificado para producción que no depende de toolbox
// =====================================================

export interface LoggerConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'performance' | 'database' | 'auth' | 'ui' | 'business' | 'security' | 'api';
  enabled: boolean;
}

class MinimalLogger {
  private config: LoggerConfig = {
    level: 'info',
    enabled: true
  };

  private shouldLog(level: string): boolean {
    if (!this.config.enabled) return false;
    
    const levels = ['error', 'warn', 'info', 'debug', 'performance', 'database', 'auth', 'ui', 'business', 'security', 'api'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: string, context: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${dataStr}`;
  }

  error(context: string, message: string, error?: Error, data?: any): void {
    if (this.shouldLog('error')) {
      const fullMessage = this.formatMessage('error', context, message, data);
      console.error(fullMessage, error || '');
    }
  }

  warn(context: string, message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      const fullMessage = this.formatMessage('warn', context, message, data);
      console.warn(fullMessage);
    }
  }

  info(context: string, message: string, data?: any): void {
    if (this.shouldLog('info')) {
      const fullMessage = this.formatMessage('info', context, message, data);
      console.log(fullMessage);
    }
  }

  debug(context: string, message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      const fullMessage = this.formatMessage('debug', context, message, data);
      console.debug(fullMessage);
    }
  }

  performance(context: string, message: string, data?: any): void {
    if (this.shouldLog('performance')) {
      const fullMessage = this.formatMessage('performance', context, message, data);
      console.log(fullMessage);
    }
  }

  database(context: string, message: string, data?: any): void {
    if (this.shouldLog('database')) {
      const fullMessage = this.formatMessage('database', context, message, data);
      console.log(fullMessage);
    }
  }

  auth(context: string, message: string, data?: any): void {
    if (this.shouldLog('auth')) {
      const fullMessage = this.formatMessage('auth', context, message, data);
      console.log(fullMessage);
    }
  }

  ui(context: string, message: string, data?: any): void {
    if (this.shouldLog('ui')) {
      const fullMessage = this.formatMessage('ui', context, message, data);
      console.log(fullMessage);
    }
  }

  business(context: string, message: string, data?: any): void {
    if (this.shouldLog('business')) {
      const fullMessage = this.formatMessage('business', context, message, data);
      console.log(fullMessage);
    }
  }

  security(context: string, message: string, data?: any): void {
    if (this.shouldLog('security')) {
      const fullMessage = this.formatMessage('security', context, message, data);
      console.log(fullMessage);
    }
  }

  api(context: string, message: string, data?: any): void {
    if (this.shouldLog('api')) {
      const fullMessage = this.formatMessage('api', context, message, data);
      console.log(fullMessage);
    }
  }

  cleanup(): void {
    // No-op en producción
  }

  exportLogs(): void {
    // No-op en producción
  }
}

export const log = new MinimalLogger();

export const loggerConfig = {
  setLogLevel: (level: string) => {
    log['config'].level = level as any;
  },
  getConfig: () => {
    return { ...log['config'] };
  }
};
