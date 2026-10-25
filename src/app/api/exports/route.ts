import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export async function GET() {
  const exportsList = await db.listAllExports();

  // Attach fresh streaming download URLs
  const enriched = await Promise.all(
    exportsList.map(async (exp) => {
      const asset = await db.getMediaAsset(exp.assetId);
      const downloadUrl = asset ? await storage.getDownloadUrl(asset.storageKey) : exp.downloadUrl;
      return {
        ...exp,
        downloadUrl,
      };
    })
  );

  return NextResponse.json({ exports: enriched });
}
