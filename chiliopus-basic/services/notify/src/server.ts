import { createApp } from './app';
import { config } from './config/env.config';
import { logger } from './config/logger.config';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`ChiliopusNotify API listening on port ${config.port}`);
});
