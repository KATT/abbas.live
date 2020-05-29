/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { cleanEnv, str, host } from 'envalid';

export const createEnv = (env: NodeJS.ProcessEnv = process.env) =>
  cleanEnv(
    env,
    {
      NODE_ENV: str({
        choices: ['development', 'test', 'production'],
        devDefault: 'development',
      }),
      API_KEY: str(),
      YOUTUBE_API_KEY: str(),
    },
    {
      strict: true,
    }
  );

export const env = createEnv(process.env);
