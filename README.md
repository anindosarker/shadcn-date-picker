# shadcn-date-picker

A date picker for shadcn/ui: date, date and time, time, week, month and year values, each as a single value or a range, with presets, limits and a phone layout. You install it with the shadcn CLI and own the code, like any shadcn component.

## Install

Base UI (shadcn style `base-nova`):

```bash
pnpm dlx shadcn@latest add anindosarker/shadcn-date-picker/date-picker-base
```

Radix UI (shadcn style `radix-nova`):

```bash
pnpm dlx shadcn@latest add anindosarker/shadcn-date-picker/date-picker-radix
```

The files land in `components/date-picker/`. The shadcn parts it uses (button, calendar, popover and others) come from your own style. The CLI rewrites the picker's imports to the aliases in your `components.json`, so a project with `~/` or a `src/` layout works as is.

Three places in the picker carry the classes of shadcn's nova style, whatever style your project uses: the dialog's close button (`absolute top-2 right-2`), the gap of the range fields in the phone dialog (`gap-2`) and the right corners of the trigger's button group (`rounded-r-lg`). On another style, change them in your copy if you want that style's values.

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

## Differences between the bases

Radix UI:

- Tab moves round the controls of an open popover and does not close it. Escape or a press outside closes it.
- On a touch screen a popover and the phone dialog open with focus on their first control. The clock's popover opens as on Base UI.

## License

MIT
