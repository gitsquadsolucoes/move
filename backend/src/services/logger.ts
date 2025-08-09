import winston from 'winston';

// Configuração de formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    return logMessage;
  })
);

// Configuração dos transportes
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  })
];

// Em produção, adicionar arquivo de log
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
  exitOnError: false,
});

// Helper functions para diferentes níveis de log
export const loggerService = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },
  
  // Log para auditoria
  audit: (action: string, userId?: string, details?: any) => {
    logger.info('AUDIT', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  // Log para performance
  performance: (operation: string, duration: number, meta?: any) => {
    logger.info('PERFORMANCE', {
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  },
  
  // Log para requests HTTP
  request: (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
    logger.info('HTTP_REQUEST', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId
    });
  }
};

export { logger };
export default logger;
