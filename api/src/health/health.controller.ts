import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SkipThrottle } from "@nestjs/throttler";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AppConfig } from "../config/configuration";

@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Get()
  async check() {
    let database: "up" | "down" = "down";
    try {
      await this.dataSource.query("SELECT 1");
      database = "up";
    } catch {
      database = "down";
    }

    const embeddings = this.config.get("embeddings", { infer: true });
    return {
      status: database === "up" ? "ok" : "degraded",
      database,
      embeddings:
        embeddings.apiUrl && embeddings.apiKey ? "configured" : "lexical-fallback",
    };
  }
}
