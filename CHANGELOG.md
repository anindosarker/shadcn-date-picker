# Changelog

## 1.0.0 - 2026-11-25

### Changed

- First stable version. The options and types of `DatePicker` are those of 0.1.1 and stay as they are.

## 0.1.1 - 2026-11-24

Second version of the shadcn/ui date picker on three bases.

- No developer warning and no Node-only read: a limit or step the picker ignores no longer logs to the console, and the picker no longer reads `process`, so a Vite app type checks without `@types/node`.
- Right-to-left: the previous and next arrows of the month and year grids point the right way on a `dir="rtl"` page.
- Base UI note: in the day calendar, arrow keys move the highlight but not keyboard focus; this is shadcn's stock `base-nova` calendar part ([shadcn-ui/ui#9401](https://github.com/shadcn-ui/ui/issues/9401)). Until it is fixed there, add `ref={ref}` to the day `Button` in your `components/ui/calendar.tsx`.

## 0.1.0 - 2026-11-23

First version of the shadcn/ui date picker on three bases.

- Base UI: `anindosarker/shadcn-date-picker/date-picker-base#v0.1.0` (style `base-nova`)
- Radix UI: `anindosarker/shadcn-date-picker/date-picker-radix#v0.1.0` (style `radix-nova`)
- React Aria: `anindosarker/shadcn-date-picker/date-picker-aria#v0.1.0` (style `aria-nova`)
