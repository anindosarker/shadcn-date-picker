import type { Meta, StoryObj } from "@storybook/react-vite"
import { format } from "date-fns"
import { expect, userEvent, within } from "storybook/test"
import { DatePicker } from "@/components/date-picker/date-picker"
import type { RangeValue } from "@/components/date-picker/types"
import { Controlled } from "./support/controlled"
import {
  browserTools,
  expectClosed,
  expectGone,
  expectRangeClosed,
  expectValue,
  openPopup,
  openRangePopup,
  rangeDialog,
  rangePopup,
  screen,
  typeKeys,
} from "./support/play"

const meta = { title: "Types/Month" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const range: RangeValue = ["2026-08", "2026-11"]

function month(grid: HTMLElement, name: string) {
  return within(grid).getByRole("button", { name })
}

export const Single: Story = {
  render: () => (
    <Controlled initial="2026-11">
      {(props) => <DatePicker type="month" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const opener = canvas.getByRole("button", { name: "Select month" })

    await step("M1 closed: month box, X, calendar button", async () => {
      await expect(canvas.getByLabelText("Month")).toHaveValue("2026-11")
      await expect(
        canvas.getByRole("button", { name: "Clear Month" })
      ).toBeVisible()
      await expect(opener).toBeVisible()
    })

    await step("P5, M9 popup: year select, arrows, twelve months", async () => {
      const panel = await openPopup(opener, "Select month")
      await expect(
        panel.getByRole("combobox", { name: "Year" })
      ).toHaveDisplayValue("2026")
      for (const name of ["Previous year", "Go to today", "Next year"]) {
        await expect(panel.getByRole("button", { name })).toBeVisible()
      }
      const grid = panel.getByRole("group", { name: "2026" })
      await expect(within(grid).getAllByRole("button")).toHaveLength(12)
      await expect(month(grid, "Nov")).toHaveAttribute("aria-pressed", "true")
    })

    await step("M10, G1 the selected month calls nothing", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Select month" }))
      await userEvent.click(
        month(panel.getByRole("group", { name: "2026" }), "Nov")
      )
      await expectClosed("Select month")
      await expectValue(canvasElement, "2026-11", 0)
    })

    await step("P6 a click on a month closes the popup", async () => {
      const panel = await openPopup(opener, "Select month")
      await userEvent.click(
        month(panel.getByRole("group", { name: "2026" }), "Mar")
      )
      await expectClosed("Select month")
      await expectValue(canvasElement, "2026-03", 1)
    })

    await step("P5 the year select moves the grid", async () => {
      const panel = await openPopup(opener, "Select month")
      await userEvent.selectOptions(
        panel.getByRole("combobox", { name: "Year" }),
        "2030"
      )
      await userEvent.click(
        month(panel.getByRole("group", { name: "2030" }), "Jan")
      )
      await expectClosed("Select month")
      await expectValue(canvasElement, "2030-01", 2)
    })

    await step("P14 today's month is marked current", async () => {
      const panel = await openPopup(opener, "Select month")
      await userEvent.click(panel.getByRole("button", { name: "Go to today" }))
      const now = new Date()
      const grid = panel.getByRole("group", { name: format(now, "yyyy") })
      await expect(month(grid, format(now, "LLL"))).toHaveAttribute(
        "aria-current",
        "date"
      )
      await userEvent.keyboard("{Escape}")
      await expectClosed("Select month")
    })

    await step("M8 X", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Clear Month" }))
      await expectValue(canvasElement, "", 3)
      await expectGone(canvasElement, "Clear Month")
    })

    if (!browserTools()) {
      return
    }

    await step("M2 a complete month typed", async () => {
      await typeKeys(canvas.getByLabelText("Month"), "11{ArrowRight}2031")
      await expectValue(canvasElement, "2031-11")
    })
  },
}

export const Range: Story = {
  render: () => (
    <Controlled initial={range}>
      {(props) => <DatePicker type="month" range {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Aug 2026 - Nov 2026" })

    await step("PR1 closed: the two months as text", async () => {
      await expect(trigger).toBeVisible()
      await expect(
        canvas.getByRole("button", { name: "Clear Month range" })
      ).toBeVisible()
    })

    await step(
      "MR1, PR9 per end a month box and a grid, never the same year",
      async () => {
        const panel = await openRangePopup(trigger)
        await expect(panel.getByLabelText("From")).toHaveValue("2026-08")
        await expect(panel.getByLabelText("To")).toHaveValue("2026-11")
        await expect(
          panel.queryByRole("button", { name: "Select month" })
        ).toBeNull()
        await expect(panel.getByRole("group", { name: "2026" })).toBeVisible()
        await expect(panel.getByRole("group", { name: "2027" })).toBeVisible()
      }
    )

    await step("PR4, PR7 both ends set: a click starts over", async () => {
      const panel = rangePopup()
      await userEvent.click(
        month(panel.getByRole("group", { name: "2026" }), "Feb")
      )
      await expectValue(canvasElement, ["2026-02", ""], 1)
      await expect(rangeDialog()).toBeVisible()
    })

    await step("PR5 only From set: the two in order", async () => {
      const panel = rangePopup()
      await userEvent.click(
        month(panel.getByRole("group", { name: "2027" }), "Jan")
      )
      await expectValue(canvasElement, ["2026-02", "2027-01"], 2)
    })

    await step("PR9 the view not moved gives way", async () => {
      const panel = rangePopup()
      await userEvent.click(
        panel.getAllByRole("button", { name: "Next year" })[0]
      )
      await expect(
        await panel.findByRole("group", { name: "2028" })
      ).toBeVisible()
      await expect(panel.getByRole("group", { name: "2027" })).toBeVisible()
      await userEvent.keyboard("{Escape}")
      await expectRangeClosed()
    })

    await step("PR1 X", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Clear Month range" })
      )
      await expectValue(canvasElement, ["", ""], 3)
      await expect(
        canvas.getByRole("button", { name: "Pick a month range" })
      ).toBeVisible()
    })
  },
}
