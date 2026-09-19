import { z } from "zod";

const environmentSchema = z.object({
  VITE_API_BASE_URL: z.url().default("http://localhost:8080")
});

const parsedEnvironment = environmentSchema.parse(import.meta.env);

export const env = Object.freeze({
  apiBaseUrl: parsedEnvironment.VITE_API_BASE_URL
});
