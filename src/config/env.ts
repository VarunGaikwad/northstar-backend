import "dotenv/config";

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  PORT: Number(getEnvVar("PORT", "3000")),

  DATABASE_URL: getEnvVar("DATABASE_URL"),

  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "7d"),

  BCRYPT_SALT_ROUNDS: Number(getEnvVar("BCRYPT_SALT_ROUNDS", "12")),

  // Optional SMTP config. If omitted, password-reset emails are logged to the
  // console instead of being sent.
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM ?? "no-reply@northstar.app",

  FRONTEND_URL: getEnvVar("FRONTEND_URL", "http://localhost:5173"),

  UNSPLASH_ACCESS_KEY: getEnvVar("UNSPLASH_ACCESS_KEY"),
};
