'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  if (!data || data.length < 2) return null;
  const points = data.map((v, i) => ({ i, v }));
  const color = positive ? '#0D9488' : '#EF4444';

  return (
    <div style={{ height: 32, marginTop: 6 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
