import Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().default(4000),
  APP_ORIGIN: Joi.string().uri().default("http://localhost:3000"),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  DATABASE_HOST: Joi.string().default("localhost"),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().allow("").required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNC: Joi.string().valid("true", "false").default("false"),
  DATABASE_MIGRATIONS_RUN: Joi.string().valid("true", "false").default("true"),
  UPLOAD_DIR: Joi.string().default("./uploads"),
  MAX_UPLOAD_BYTES: Joi.number().default(5 * 1024 * 1024),
  EMBEDDING_API_URL: Joi.string().allow("").default(""),
  EMBEDDING_API_KEY: Joi.string().allow("").default(""),
  EMBEDDING_MODEL: Joi.string().default("text-embedding-3-small"),
});
