import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tools: {
      core: 8,
      dynamic: 0
    },
    integrations: {
      openai: !!process.env.OPENAI_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      qdrant: !!process.env.QDRANT_API_KEY,
      github: !!process.env.TOKEN_GITHUB || !!process.env.GITHUB_TOKEN
    }
  });
}
