import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { DatePicker } from "@/components/date-picker/date-picker"
import type { RangeValue } from "@/components/date-picker/types"
import { Controlled } from "./support/controlled"
import {
  browserTools,
  day,
  expectClosed,
  expectGone,
  expectValue,
  openPopup,
  screen,
  typeKeys,
} from "./support/play"

const meta = { title: "Types/Week" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const range: RangeValue = ["2026-W44", "2026-W47"]

export const Single: Story = {
  render: () => (
    <Controlled initial="2026-W47">
      {(props) => <DatePicker type="week" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const opener = canvas.getByRole("button", { name: "Select week" })

    await step("W1 closed: week box, X, calendar button", async () => {
      await expect(canvas.getByLabelText("Week")).toHaveValue("2026-W47")
      await expect(
        canvas.getByRole("button", { name: "Clear Week" })
      ).toBeVisible()
      await expect(opener).toBeVisible()
    })

    await step("P2 ISO week numbers, Monday first", async () => {
      const panel = await openPopup(opener, "Select week")
      const week = panel.getByRole("rowheader", { name: "Week 47" })
      await expect(week).toHaveTextContent("47")
      const days = within(week.closest("tr")!).getAllByRole("button")
      await expect(days[0]).toHaveAccessibleName(
        expect.stringMatching(/^Monday, November 16th, 2026/)
      )
    })

    await step("W10, G1 a day of the selected week calls nothing", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Select week" }))
      await userEvent.click(day(panel, "November 18th, 2026"))
      await expectClosed("Select week")
      await expectValue(canvasElement, "2026-W47", 0)
    })

    await step("P3 a day of another week", async () => {
      const panel = await openPopup(opener, "Select week")
      await userEvent.click(day(panel, "December 1st, 2026"))
      await expectClosed("Select week")
      await expectValue(canvasElement, "2026-W49", 1)
    })

    await step("W8 X", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Clear Week" }))
      await expectValue(canvasElement, "", 2)
      await expectGone(canvasElement, "Clear Week")
    })

    if (!browserTools()) {
      return
    }

    await step("W2 a complete week typed", async () => {
      await typeKeys(canvas.getByLabelText("Week"), "472031")
      await expectValue(canvasElement, "2031-W47")
    })
  },
}

export const Range: Story = {
  render: () => (
    <Controlled initial={range}>
      {(props) => <DatePicker type="week" range {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", {
      name: "Week 44, 2026 - Week 47, 2026",
    })

    await step("PR1 closed: the two weeks as text, X", async () => {
      await expect(trigger).toBeVisible()
      await expect(
        canvas.getByRole("button", { name: "Clear Week range" })
      ).toBeVisible()
    })

    await step("WR1 popup: per end a week box and a calendar", async () => {
      const panel = await openPopup(trigger, "Week range")
      await expect(panel.getByLabelText("From")).toHaveValue("2026-W44")
      await expect(panel.getByLabelText("To")).toHaveValue("2026-W47")
      await expect(
        panel.queryByRole("button", { name: "Select week" })
      ).toBeNull()
      await expect(
        panel.getAllByRole<HTMLSelectElement>("combobox", {
          name: "Choose the Month",
        })
      ).toHaveLength(2)
    })

    await step(
      "PR4, PR7 both ends set: a click starts over, popup open",
      async () => {
        const panel = within(screen.getByRole("dialog", { name: "Week range" }))
        await userEvent.click(day(panel, "October 14th, 2026"))
        await expectValue(canvasElement, ["2026-W42", ""], 1)
        await expect(
          screen.getByRole("dialog", { name: "Week range" })
        ).toBeVisible()
      }
    )

    await step("PR5 only From set: the two in order", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Week range" }))
      await userEvent.click(day(panel, "October 7th, 2026"))
      await expectValue(canvasElement, ["2026-W41", "2026-W42"], 2)
    })

    await step("PR6 only To set: the two in order", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Week range" }))
      await userEvent.click(panel.getByRole("button", { name: "Clear From" }))
      await expectValue(canvasElement, ["", "2026-W42"], 3)
      await userEvent.keyboard("{Escape}")
      await expectClosed("Week range")
    })

    await step(
      "PR8 only To set, opening: To's view, From's before",
      async () => {
        const panel = await openPopup(
          canvas.getByRole("button", { name: /Week 42, 2026$/ }),
          "Week range"
        )
        const months = panel.getAllByRole<HTMLSelectElement>("combobox", {
          name: "Choose the Month",
        })
        await expect(months.map((select) => select.value)).toEqual(["8", "9"])
      }
    )

    await step("PR6 only To set: the two in order", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Week range" }))
      await userEvent.click(day(panel, "October 21st, 2026"))
      await expectValue(canvasElement, ["2026-W42", "2026-W43"], 4)
      await userEvent.keyboard("{Escape}")
      await expectClosed("Week range")
    })

    await step("PR1 X empties both ends", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Clear Week range" })
      )
      await expectValue(canvasElement, ["", ""], 5)
      await expect(
        canvas.getByRole("button", { name: "Pick a week range" })
      ).toHaveFocus()
    })
  },
}
