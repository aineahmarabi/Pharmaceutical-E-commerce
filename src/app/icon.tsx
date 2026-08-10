import { ImageResponse } from 'next/og';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

async function getLogoUrl(): Promise<string | null> {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
    const settings = await convex.query(api.settings.getStoreSettings, {});
    const logo = settings.find((s) => s.key === 'logo')?.value;
    return typeof logo === 'string' && logo ? logo : null;
  } catch {
    return null;
  }
}

export default async function Icon() {
  const logoUrl = await getLogoUrl();

  if (logoUrl) {
    const res = await fetch(logoUrl);
    if (res.ok) {
      return new Response(res.body, {
        headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'image/png' },
      });
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0D9488',
          borderRadius: 8,
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
