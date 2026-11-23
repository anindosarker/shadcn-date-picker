# shadcn-date-picker

A date picker for shadcn/ui: date, date and time, time, week, month and year values, each as a single value or a range, with presets, limits and a phone layout. You install it with the shadcn CLI and own the code, like any shadcn component.

## Install

Base UI (shadcn style `base-nova`):

```bash
pnpm dlx shadcn@latest add anindosarker/shadcn-date-picker/date-picker-base
```

The files land in `components/date-picker/`. The shadcn parts it uses (button, calendar, popover and others) come from your own style.

## Usage

The picker is controlled: pass `value` and `onChange`.

```tsx
"use client"

import * as React from "react"
import { DatePicker } from "@/components/date-picker/date-picker"

export function Example() {
  const [date, setDate] = React.useState("")
  const [range, setRange] = React.useState<[string, string]>(["", ""])
  return (
    <>
      <DatePicker type="date" value={date} onChange={setDate} />
      <DatePicker type="month" range value={range} onChange={setRange} />
    </>
  )
}
```

## License

MIT
