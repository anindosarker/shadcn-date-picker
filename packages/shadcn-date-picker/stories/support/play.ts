import { format } from "date-fns"
import { expect, userEvent, waitFor, within } from "storybook/test"
import type { page, userEvent as browserUserEvent } from "vitest/browser"

type BrowserTools = { userEvent: typeof browserUserEvent; page: typeof page }

type Output = "value" | "calls" | "last call"

const screen = within(document.body)

/**
 * Playwright's keyboard and viewport, set by .storybook/vitest.setup.ts. The
 * browser's own date, time, week and month boxes take only real keys, so the
 * steps that type into them run in the Vitest run only.
 */
function browserTools() {
  return (globalThis as { dpBrowser?: BrowserTools }).dpBrowser
}

function output(canvas: HTMLElement, name: Output) {
  return within(canvas).getByLabelText(name, { selector: "output" })
}

async function expectValue(
  canvas: HTMLElement,
  value: unknown,
  calls?: number
) {
  await waitFor(() =>
    expect(output(canvas, "value").textContent).toBe(JSON.stringify(value))
  )
  if (calls !== undefined) {
    await expect(output(canvas, "calls").textContent).toBe(String(calls))
  }
}

function callCount(canvas: HTMLElement) {
  return Number(output(canvas, "calls").textContent)
}

async function openPopup(trigger: HTMLElement, name: string) {
  await userEvent.click(trigger)
  const popup = await screen.findByRole("dialog", { name })
  await waitFor(() => expect(popup).toBeVisible())
  return within(popup)
}

async function expectClosed(name: string) {
  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name })).not.toBeInTheDocument()
  )
}

/** A range popup, found by its From box: its name differs per base (D171). */
function findRangePopup() {
  return screen
    .queryAllByRole("dialog")
    .find((dialog) => within(dialog).queryAllByLabelText("From").length > 0)
}

function rangeDialog() {
  const popup = findRangePopup()
  if (!popup) {
    throw new Error("No range popup is open")
  }
  return popup
}

function rangePopup() {
  return within(rangeDialog())
}

async function openRangePopup(trigger: HTMLElement) {
  await userEvent.click(trigger)
  const popup = await waitFor(() => {
    const found = findRangePopup()
    expect(found).toBeVisible()
    return found as HTMLElement
  })
  return within(popup)
}

async function expectRangeClosed() {
  await waitFor(() => expect(findRangePopup()).toBeUndefined())
}

function isRangeOpen() {
  return findRangePopup() !== undefined
}

/** A button the user cannot see or reach: not rendered, or hidden. */
async function expectGone(scope: HTMLElement, name: string) {
  await waitFor(() =>
    expect(within(scope).queryByRole("button", { name })).toBeNull()
  )
}

/** A calendar day by its date words, "November 10th, 2026"; the first when the day shows twice. */
function day(panel: ReturnType<typeof within>, words: string) {
  return panel.getAllByRole("button", {
    name: (name: string) => name.includes(`, ${words}`),
  })[0]
}

function todayButton(panel: ReturnType<typeof within>) {
  return panel.getAllByRole("button", { name: /^Today, / })[0]
}

const today = () => format(new Date(), "yyyy-MM-dd")

function realTools() {
  const tools = browserTools()
  if (!tools) {
    throw new Error("Real keys run in the Vitest run only")
  }
  return tools
}

/** Types real keys into a browser box from its first part. */
async function typeKeys(input: HTMLElement, keys: string) {
  input.focus()
  await realTools().userEvent.keyboard(keys)
}

/** Real keys into the focused element. */
async function realKeys(keys: string) {
  await realTools().userEvent.keyboard(keys)
}

let dayFirst: boolean | undefined

/**
 * Whether the browser's date box shows the day before the month: it follows
 * the system's region. Read at the start of a play, before a popup opens: the
 * probe box takes focus, and focus outside closes a Radix popover.
 */
async function readDateOrder() {
  if (dayFirst !== undefined || !browserTools()) {
    return
  }
  if (screen.queryAllByRole("dialog").length > 0) {
    throw new Error("readDateOrder runs before a popup opens")
  }
  const probe = document.createElement("input")
  probe.type = "date"
  probe.max = "9999-12-31"
  document.body.append(probe)
  await typeKeys(probe, "01022003")
  dayFirst = probe.value === "2003-02-01"
  probe.remove()
}

/** The keys that type "yyyy-MM-dd" into a browser date or date-time box. */
function dateKeys(date: string) {
  if (dayFirst === undefined) {
    throw new Error("readDateOrder runs at the start of the play")
  }
  const [year, month, dayOfMonth] = date.split("-")
  return dayFirst
    ? `${dayOfMonth}${month}${year}`
    : `${month}${dayOfMonth}${year}`
}

export {
  browserTools,
  callCount,
  dateKeys,
  day,
  expectClosed,
  expectGone,
  expectRangeClosed,
  expectValue,
  isRangeOpen,
  openPopup,
  openRangePopup,
  rangeDialog,
  rangePopup,
  readDateOrder,
  realKeys,
  screen,
  today,
  todayButton,
  typeKeys,
}
