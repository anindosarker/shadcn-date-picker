// tools/registry-build.mjs lists this item once registry/radix/components/date-picker exists (tools/bases.mjs readyBases), and fills its files and dependencies from it.
import type { Registry } from "shadcn/schema"

export const registry = {
  name: "shadcn-date-picker",
  homepage: "https://github.com/anindosarker/shadcn-date-picker",
  items: [
    {
      name: "date-picker-radix",
      type: "registry:component",
      title: "Date Picker (Radix UI)",
      description:
        "A date, time, week, month and year picker with ranges, built on shadcn/ui and Radix UI.",
    },
  ],
} satisfies Registry
