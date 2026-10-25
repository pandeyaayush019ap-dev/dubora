import { NextResponse } from 'next/server';
import { getProviderHealth } from '@/lib/providers/registry';

export async function GET() {
  const health = getProviderHealth();
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: health,
  });
}
