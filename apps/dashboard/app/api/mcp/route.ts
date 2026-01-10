import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'nexifyai-mcp-server',
    version: '1.0.0',
    protocol: 'mcp',
    capabilities: ['tools', 'resources'],
    endpoints: {
      tools: '/api/mcp/tools',
      call: '/api/mcp/call',
      status: '/api/mcp/status'
    }
  });
}
