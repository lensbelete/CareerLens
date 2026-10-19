import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash } from "crypto";
import { Repository } from "typeorm";
import { AppConfig } from "../config/configuration";
import { EmbeddingCache } from "./embedding-cache.entity";

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(
    @InjectRepository(EmbeddingCache)
    private readonly cache: Repository<EmbeddingCache>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  isConfigured(): boolean {
    const embeddings = this.config.get("embeddings", { infer: true });
    return Boolean(embeddings.apiUrl && embeddings.apiKey);
  }

  async embed(text: string): Promise<number[] | null> {
    if (!this.isConfigured()) return null;

    const embeddings = this.config.get("embeddings", { infer: true });
    const textHash = createHash("sha256").update(text).digest("hex");
    const cached = await this.cache.findOne({
      where: {
        textHash,
        provider: embeddings.apiUrl,
        model: embeddings.model,
      },
    });
    if (cached) return cached.vector;

    try {
      const response = await fetch(embeddings.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${embeddings.apiKey}`,
        },
        body: JSON.stringify({
          model: embeddings.model,
          input: text.slice(0, 20_000),
        }),
      });
      if (!response.ok) {
        this.logger.warn(
          `Embedding request failed (${response.status}); using lexical fallback`,
        );
        return null;
      }
      const body = (await response.json()) as {
        data?: Array<{ embedding: number[] }>;
      };
      const vector = body.data?.[0]?.embedding;
      if (!vector || vector.length === 0) return null;

      await this.cache.save(
        this.cache.create({
          textHash,
          provider: embeddings.apiUrl,
          model: embeddings.model,
          vector,
        }),
      );
      return vector;
    } catch (error) {
      this.logger.warn(
        `Embedding request errored; using lexical fallback: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
