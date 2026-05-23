export const AppConfig = {
  appName: '小Q记账',
  version: '1.0.0',
  defaultCurrency: 'CNY',
  pageSize: 50,
  claudeModel: 'claude-haiku-4-5-20251001',
  maxClassificationRetries: 2,
  classificationTimeout: 10000,
  cacheMaxAge: 90 * 24 * 60 * 60 * 1000,
  ocrConfidenceThreshold: 0.7,
  budgetWarningLevels: {
    safe: 0.6,
    warning: 0.8,
    danger: 1.0,
  },
};
