import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { DatePicker } from "@/components/date-picker/date-picker"
import type { RangeValue } from "@/components/date-picker/types"
import { Controlled } from "./support/controlled"
import {
  callCount,
  expectClosed,
  expectValue,
  openPopup,
  openRangePopup,
  rangePopup,
  screen,
} from "./support/play"

const meta = { title: "Types/Year" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const range: RangeValue = ["2020", "2024"]

function year(grid: HTMLElement, name: string) {
  return within(grid).getByRole("button", { name })
}

export const Single: Story = {
  render: () => (
    <Controlled initial="2026">
      {(props) => <DatePicker type="year" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const opener = canvas.getByRole("button", { name: "Select year" })
    const box = () => canvas.getByRole("textbox", { name: "Year" })

    await step(
      "P7 closed: a four-digit year box, X, calendar button",
      async () => {
        await expect(box()).toHaveValue("2026")
        await expect(canvas.getByPlaceholderText("yyyy")).toBe(box())
        await expect(
          canvas.getByRole("button", { name: "Clear Year" })
        ).toBeVisible()
        await expect(opener).toBeVisible()
      }
    )

    await step("P10 popup: decade, arrows, ten years", async () => {
      const panel = await openPopup(opener, "Select year")
      const grid = panel.getByRole("group", { name: "2020 – 2029" })
      await expect(within(grid).getAllByRole("button")).toHaveLength(10)
      await expect(year(grid, "2026")).toHaveAttribute("aria-pressed", "true")
      for (const name of ["Previous years", "Go to today", "Next years"]) {
        await expect(panel.getByRole("button", { name })).toBeVisible()
      }
    })

    await step("P11 a click on a year closes the popup", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Select year" }))
      await userEvent.click(
        year(panel.getByRole("group", { name: "2020 – 2029" }), "2023")
      )
      await expectClosed("Select year")
      await expectValue(canvasElement, "2023", 1)
    })

    await step("P8 only a complete year is stored", async () => {
      await userEvent.clear(box())
      await expectValue(canvasElement, "", 2)
      await userEvent.type(box(), "195")
      await expect(box()).toHaveValue("195")
      await expectValue(canvasElement, "", 2)
      await userEvent.type(box(), "1")
      await expectValue(canvasElement, "1951", 3)
    })

    await step("P8, N2 0000 and letters store nothing", async () => {
      await userEvent.clear(box())
      await userEvent.type(box(), "0000")
      await expectValue(canvasElement, "", 4)
      await userEvent.clear(box())
      await userEvent.type(box(), "20ab")
      await expectValue(canvasElement, "", 4)
    })

    await step("P10 a typed far year opens on its decade", async () => {
      await userEvent.clear(box())
      await userEvent.type(box(), "1443")
      await expectValue(canvasElement, "1443", 5)
      const panel = await openPopup(opener, "Select year")
      await expect(
        panel.getByRole("group", { name: "1440 – 1449" })
      ).toBeVisible()
      await userEvent.keyboard("{Escape}")
      await expectClosed("Select year")
    })
  },
}

export const Range: Story = {
  render: () => (
    <Controlled initial={range}>
      {(props) => <DatePicker type="year" range {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "2020 - 2024" })

    await step("PR1 closed: the two years as text", async () => {
      await expect(trigger).toBeVisible()
    })

    await step("PR3, PR9 per end a year box and a decade grid", async () => {
      const panel = await openRangePopup(trigger)
      await expect(panel.getByRole("textbox", { name: "From" })).toHaveValue(
        "2020"
      )
      await expect(panel.getByRole("textbox", { name: "To" })).toHaveValue(
        "2024"
      )
      await expect(
        panel.getByRole("group", { name: "2020 – 2029" })
      ).toBeVisible()
      await expect(
        panel.getByRole("group", { name: "2030 – 2039" })
      ).toBeVisible()
    })

    await step(
      "PR11 a reversed typed pair is ordered once focus leaves both boxes",
      async () => {
        const panel = rangePopup()
        const from = panel.getByRole("textbox", { name: "From" })
        await userEvent.clear(from)
        await userEvent.type(from, "2030")
        await expectValue(canvasElement, ["2030", "2024"])
        const calls = callCount(canvasElement)
        await userEvent.click(panel.getByRole("textbox", { name: "To" }))
        await expectValue(canvasElement, ["2030", "2024"], calls)
        await userEvent.click(
          panel.getAllByRole("button", { name: "Go to today" })[0]
        )
        await expectValue(canvasElement, ["2024", "2030"], calls + 1)
      }
    )

    await step(
      "PR10 a far year typed: that end's grid follows at once",
      async () => {
        const panel = rangePopup()
        const from = panel.getByRole("textbox", { name: "From" })
        await userEvent.clear(from)
        await userEvent.type(from, "1443")
        await expectValue(canvasElement, ["1443", "2030"])
        await expect(
          await panel.findByRole("group", { name: "1440 – 1449" })
        ).toBeVisible()
      }
    )

    await step("PR4, PR5 a click starts over, then orders", async () => {
      const panel = rangePopup()
      const calls = callCount(canvasElement)
      await userEvent.click(
        year(panel.getByRole("group", { name: "1440 – 1449" }), "1445")
      )
      await expectValue(canvasElement, ["1445", ""], calls + 1)
      await userEvent.click(
        year(panel.getByRole("group", { name: "1440 – 1449" }), "1441")
      )
      await expectValue(canvasElement, ["1441", "1445"], calls + 2)
    })
  },
}
