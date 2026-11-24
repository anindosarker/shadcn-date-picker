'use client';

import * as React from 'react';
import { DatePicker } from '@/components/date-picker/date-picker';
import type { RangeValue } from '@/components/date-picker/types';

export default function DateRangeDemo() {
  const [value, setValue] = React.useState<RangeValue>([
    '2026-11-03',
    '2026-11-12',
  ]);
  return (
    <div className="flex flex-col items-start gap-4">
      <DatePicker type="date" range value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        value <output aria-label="value">{JSON.stringify(value)}</output>
      </p>
    </div>
  );
}
