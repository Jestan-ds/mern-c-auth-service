import { Config } from './config';
import app from './app';
import logger from './config/logger';

const startServer = () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => {
      logger.info(`Server running on port  ${PORT}`, { port: PORT });
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
    console.log('Server failed to start');
  }
};

startServer();
