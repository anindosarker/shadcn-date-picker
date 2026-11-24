'use client';

import * as React from 'react';
import { DatePicker } from '@/components/date-picker/date-picker';

export default function DateDemo() {
  const [value, setValue] = React.useState('2026-11-21');
  return (
    <div className="flex flex-col items-start gap-4">
      <DatePicker type="date" value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        value <output aria-label="value">{JSON.stringify(value)}</output>
      </p>
    </div>
  );
}
