export type AppConfig = {
  nodeEnv: string;
  port: number;
  appOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    synchronize: boolean;
    migrationsRun: boolean;
  };
  uploadDir: string;
  maxUploadBytes: number;
  embeddings: {
    apiUrl: string;
    apiKey: string;
    model: string;
  };
};

export function configuration(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 4000),
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    database: {
      host: process.env.DATABASE_HOST ?? "localhost",
      port: Number(process.env.DATABASE_PORT ?? 5432),
      user: process.env.DATABASE_USER ?? "careerlens",
      password: process.env.DATABASE_PASSWORD ?? "careerlens",
      name: process.env.DATABASE_NAME ?? "careerlens",
      synchronize: process.env.DATABASE_SYNC === "true",
      migrationsRun: process.env.DATABASE_MIGRATIONS_RUN !== "false",
    },
    uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
    maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024),
    embeddings: {
      apiUrl: process.env.EMBEDDING_API_URL ?? "",
      apiKey: process.env.EMBEDDING_API_KEY ?? "",
      model: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
    },
  };
}
