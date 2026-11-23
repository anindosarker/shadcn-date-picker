// tools/registry-build.mjs fills each item's files and dependencies from components/date-picker.
import type { Registry } from "shadcn/schema"

export const registry = {
  name: "shadcn-date-picker",
  homepage: "https://github.com/anindosarker/shadcn-date-picker",
  items: [
    {
      name: "date-picker-base",
      type: "registry:component",
      title: "Date Picker (Base UI)",
      description:
        "A date, time, week, month and year picker with ranges, built on shadcn/ui and Base UI.",
    },
  ],
} satisfies Registry
