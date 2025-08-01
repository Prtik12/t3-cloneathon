// https://env.t3.gg/docs/nextjs#create-your-schema
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const serverEnv = createEnv({
  server: {
    XAI_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    GROQ_API_KEY: z.string().min(1).optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
    DAYTONA_API_KEY: z.string().min(1).optional(),
    E2B_API_KEY: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    TWITTER_CLIENT_ID: z.string().min(1).optional(),
    TWITTER_CLIENT_SECRET: z.string().min(1).optional(),
    ELEVENLABS_API_KEY: z.string().min(1).optional(),
    TAVILY_API_KEY: z.string().min(1).optional(),
    EXA_API_KEY: z.string().min(1).optional(),
    TMDB_API_KEY: z.string().min(1).optional(),
    YT_ENDPOINT: z.string().min(1).optional(), // YouTube Data API v3 Key
    FIRECRAWL_API_KEY: z.string().min(1).optional(),
    SANDBOX_TEMPLATE_ID: z.string().min(1).optional(),
    CRON_SECRET: z.string().min(1).optional(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
    MEM0_API_KEY: z.string().min(1).optional(),
    MEM0_ORG_ID: z.string().min(1).optional(),
    MEM0_PROJECT_ID: z.string().min(1).optional(),
    SMITHERY_API_KEY: z.string().min(1).optional(),
    ALLOWED_ORIGINS: z.string().optional().default('http://localhost:3000'),
  },
  experimental__runtimeEnv: process.env,
})
