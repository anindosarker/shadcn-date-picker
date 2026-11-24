import type { Meta, StoryObj } from "@storybook/react-vite"
import { format } from "date-fns"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { DatePicker } from "@/components/date-picker/date-picker"
import type { RangeValue } from "@/components/date-picker/types"
import { Controlled } from "./support/controlled"
import {
  browserTools,
  callCount,
  dateKeys,
  day,
  expectClosed,
  expectGone,
  expectRangeClosed,
  expectValue,
  openPopup,
  openRangePopup,
  rangePopup,
  readDateOrder,
  realKeys,
  screen,
  today,
  todayButton,
  typeKeys,
} from "./support/play"

const meta = { title: "Types/Date" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const range: RangeValue = ["2026-11-03", "2026-11-12"]

export const Single: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => <DatePicker type="date" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await readDateOrder()
    const box = canvas.getByLabelText("Date")
    const clear = canvas.getByRole("button", { name: "Clear Date" })
    const opener = canvas.getByRole("button", { name: "Select date" })

    await step("D1 closed: date box, X, calendar button", async () => {
      await expect(box).toHaveValue("2026-11-21")
      await expect(clear).toBeVisible()
      await expect(opener).toBeVisible()
    })

    await step("D2, D3, D7 popup on the value's month", async () => {
      const panel = await openPopup(opener, "Select date")
      await expect(
        panel.getByRole("combobox", { name: "Choose the Month" })
      ).toHaveDisplayValue("Nov")
      const years = panel.getByRole("combobox", { name: "Choose the Year" })
      await expect(years).toHaveDisplayValue("2026")
      const options = within(years).getAllByRole("option")
      await expect(options[0]).toHaveTextContent("1900")
      await expect(options.at(-1)).toHaveTextContent("2100")
      for (const name of [
        "Go to the Previous Month",
        "Go to today",
        "Go to the Next Month",
      ]) {
        await expect(panel.getByRole("button", { name })).toBeVisible()
      }
    })

    await step("D4, B7 a click on a day closes the popup", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Select date" }))
      await userEvent.click(day(panel, "November 10th, 2026"))
      await expectClosed("Select date")
      await expectValue(canvasElement, "2026-11-10", 1)
      await expect(canvas.getByLabelText("Date")).toHaveValue("2026-11-10")
    })

    await step("D5, G1 a click on the selected day calls nothing", async () => {
      const panel = await openPopup(opener, "Select date")
      await userEvent.click(day(panel, "November 10th, 2026"))
      await expectClosed("Select date")
      await expectValue(canvasElement, "2026-11-10", 1)
    })

    await step("D10 Today shows today's month; U2 Escape closes", async () => {
      const panel = await openPopup(opener, "Select date")
      await userEvent.click(panel.getByRole("button", { name: "Go to today" }))
      await expect(
        panel.getByRole("combobox", { name: "Choose the Month" })
      ).toHaveDisplayValue(format(new Date(), "LLL"))
      await expect(
        panel.getByRole("combobox", { name: "Choose the Year" })
      ).toHaveDisplayValue(format(new Date(), "yyyy"))
      await userEvent.keyboard("{Escape}")
      await expectClosed("Select date")
      await expectValue(canvasElement, "2026-11-10", 1)
    })

    await step("U2 a press outside closes", async () => {
      await openPopup(opener, "Select date")
      await userEvent.click(canvas.getByLabelText("value"))
      await expectClosed("Select date")
    })

    await step("B6 X empties the box", async () => {
      await userEvent.click(clear)
      await expectValue(canvasElement, "", 2)
      await expect(canvas.getByLabelText("Date")).toHaveValue("")
      await expectGone(canvasElement, "Clear Date")
    })

    if (!browserTools()) {
      return
    }

    await step("B1 a complete date typed", async () => {
      await typeKeys(canvas.getByLabelText("Date"), dateKeys("2026-11-25"))
      await expectValue(canvasElement, "2026-11-25")
      await expect(canvas.getByLabelText("last call")).toHaveTextContent(
        '"2026-11-25"'
      )
    })

    await step(
      "B2, N1 half-typed: the X shows, the value is empty",
      async () => {
        const calls = callCount(canvasElement)
        await realKeys("{Backspace}")
        await expectValue(canvasElement, "", calls + 1)
        await userEvent.click(canvas.getByLabelText("value"))
        await expect(
          canvas.getByRole("button", { name: "Clear Date" })
        ).toBeVisible()
      }
    )

    await step("B6 X empties a half-typed box, no call", async () => {
      const calls = callCount(canvasElement)
      await userEvent.click(canvas.getByRole("button", { name: "Clear Date" }))
      await expectGone(canvasElement, "Clear Date")
      await expectValue(canvasElement, "", calls)
    })
  },
}

export const Range: Story = {
  render: () => (
    <Controlled initial={range}>
      {(props) => <DatePicker type="date" range {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await readDateOrder()
    const trigger = canvas.getByRole("button", {
      name: "Nov 3, 2026 - Nov 12, 2026",
    })

    await step("R1 closed: the two ends as text, X", async () => {
      await expect(trigger).toBeVisible()
      await expect(
        canvas.getByRole("button", { name: "Clear Date range" })
      ).toBeVisible()
    })

    await step("R3 popup: From and To, each a box and a calendar", async () => {
      const panel = await openRangePopup(trigger)
      await expect(panel.getByLabelText("From")).toHaveValue("2026-11-03")
      await expect(panel.getByLabelText("To")).toHaveValue("2026-11-12")
      const months = panel.getAllByRole<HTMLSelectElement>("combobox", {
        name: "Choose the Month",
      })
      await expect(months.map((select) => select.value)).toEqual(["10", "11"])
    })

    await step("R7, R11 react-day-picker's range rule", async () => {
      const panel = rangePopup()
      await userEvent.click(day(panel, "November 1st, 2026"))
      await expectValue(canvasElement, ["2026-11-01", "2026-11-12"], 1)
      await userEvent.click(day(panel, "November 20th, 2026"))
      await expectValue(canvasElement, ["2026-11-01", "2026-11-20"], 2)
      const months = panel.getAllByRole<HTMLSelectElement>("combobox", {
        name: "Choose the Month",
      })
      await expect(months.map((select) => select.value)).toEqual(["10", "11"])
    })

    await step(
      "R10 only To set: the clicked day and To's day in order",
      async () => {
        const panel = rangePopup()
        await userEvent.click(panel.getByRole("button", { name: "Clear From" }))
        await expectValue(canvasElement, ["", "2026-11-20"], 3)
        await userEvent.click(day(panel, "November 25th, 2026"))
        await expectValue(canvasElement, ["2026-11-20", "2026-11-25"], 4)
      }
    )

    await step("R17 the calendar not moved gives way", async () => {
      const panel = rangePopup()
      const [next] = panel.getAllByRole("button", {
        name: "Go to the Next Month",
      })
      const months = () =>
        panel
          .getAllByRole<HTMLSelectElement>("combobox", {
            name: "Choose the Month",
          })
          .map((select) => select.value)
      await expect(months()).toEqual(["9", "10"])
      await userEvent.click(next)
      await waitFor(() => expect(months()).toEqual(["10", "11"]))
      await userEvent.keyboard("{Escape}")
      await expectRangeClosed()
    })

    await step("R2 X on the trigger, focus back on the trigger", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Clear Date range" })
      )
      await expectValue(canvasElement, ["", ""], 5)
      const empty = canvas.getByRole("button", { name: "Pick a date" })
      await expect(empty).toHaveFocus()
    })

    await step("R6, R7 a first click, then the one day again", async () => {
      const panel = await openRangePopup(
        canvas.getByRole("button", { name: "Pick a date" })
      )
      await userEvent.click(todayButton(panel))
      await expectValue(canvasElement, [today(), today()], 6)
      await userEvent.click(todayButton(panel))
      await expectValue(canvasElement, ["", ""], 7)
    })

    if (!browserTools()) {
      return
    }

    await step("R12, R14 typed ends, reversed as typed", async () => {
      const panel = rangePopup()
      await typeKeys(panel.getByLabelText("From"), dateKeys("2026-11-20"))
      await expectValue(canvasElement, ["2026-11-20", ""])
      await typeKeys(panel.getByLabelText("To"), dateKeys("2026-11-05"))
      await expectValue(canvasElement, ["2026-11-20", "2026-11-05"])
      const months = panel.getAllByRole<HTMLSelectElement>("combobox", {
        name: "Choose the Month",
      })
      await expect(months.map((select) => select.value)).toEqual(["10", "11"])
    })

    await step("R15 leaving both boxes orders the pair, once", async () => {
      const panel = rangePopup()
      const calls = callCount(canvasElement)
      await userEvent.click(
        panel.getAllByRole("button", { name: "Go to today" })[0]
      )
      await expectValue(canvasElement, ["2026-11-05", "2026-11-20"], calls + 1)
    })

    await step(
      "R13, F5 a far year typed: the calendar follows every digit",
      async () => {
        const panel = rangePopup()
        const from = panel.getByLabelText("From")
        await typeKeys(from, "{ArrowRight}{ArrowRight}")
        for (const [digit, year] of [
          ["1", "0001"],
          ["4", "0014"],
          ["4", "0144"],
          ["3", "1443"],
        ]) {
          await realKeys(digit)
          await expectValue(canvasElement, [`${year}-11-05`, "2026-11-20"])
        }
        await expect(from).toHaveFocus()
        const [years] = panel.getAllByRole("combobox", {
          name: "Choose the Year",
        })
        await expect(years).toHaveDisplayValue("1443")
        await expect(within(years).getAllByRole("option")[0]).toHaveTextContent(
          "1400"
        )
        const calls = callCount(canvasElement)
        await userEvent.click(day(panel, "November 1st, 1443"))
        await expectValue(
          canvasElement,
          ["1443-11-01", "2026-11-20"],
          calls + 1
        )
      }
    )
  },
}
