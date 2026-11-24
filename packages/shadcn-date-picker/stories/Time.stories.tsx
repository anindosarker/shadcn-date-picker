import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { DatePicker } from "@/components/date-picker/date-picker"
import type { RangeValue } from "@/components/date-picker/types"
import { Controlled } from "./support/controlled"
import {
  browserTools,
  expectClosed,
  expectValue,
  openPopup,
  screen,
  typeKeys,
} from "./support/play"

const meta = { title: "Types/Time" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const range: RangeValue = ["22:00", "06:00"]

function option(
  clock: ReturnType<typeof within>,
  column: string,
  name: string
) {
  return within(clock.getByRole("group", { name: column })).getByRole(
    "button",
    { name }
  )
}

export const Single: Story = {
  render: () => (
    <Controlled initial="10:30">
      {(props) => <DatePicker type="time" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const opener = canvas.getByRole("button", { name: "Select time" })

    await step("T1 closed: time box, X, clock button", async () => {
      await expect(canvas.getByLabelText("Time")).toHaveValue("10:30")
      await expect(
        canvas.getByRole("button", { name: "Clear Time" })
      ).toBeVisible()
      await expect(opener).toBeVisible()
    })

    await step(
      "C1, C2, C3 the clock's columns, focus on the clock",
      async () => {
        const clock = await openPopup(opener, "Select time")
        await expect(
          screen.getByRole("dialog", { name: "Select time" })
        ).toHaveFocus()
        await expect(clock.getByRole("group", { name: "Hour" })).toBeVisible()
        await expect(clock.getByRole("group", { name: "Minute" })).toBeVisible()
        await expect(clock.queryByRole("group", { name: "Second" })).toBeNull()
        const minutes = within(
          clock.getByRole("group", { name: "Minute" })
        ).getAllByRole("button")
        await expect(minutes).toHaveLength(60)
        await expect(option(clock, "Minute", "30")).toHaveAttribute(
          "aria-pressed",
          "true"
        )
      }
    )

    await step(
      "C7 a pick replaces one unit; the clock stays open",
      async () => {
        const clock = within(
          screen.getByRole("dialog", { name: "Select time" })
        )
        const hour12 = clock.queryByRole("group", { name: "AM or PM" }) !== null
        await userEvent.click(option(clock, "Hour", hour12 ? "3" : "03"))
        await expectValue(canvasElement, "03:30", 1)
        if (hour12) {
          await userEvent.click(option(clock, "AM or PM", "PM"))
        } else {
          await userEvent.click(option(clock, "Hour", "15"))
        }
        await expectValue(canvasElement, "15:30", 2)
        await expect(
          screen.getByRole("dialog", { name: "Select time" })
        ).toBeVisible()
      }
    )

    await step("C8 an option is a button: Enter picks it", async () => {
      const clock = within(screen.getByRole("dialog", { name: "Select time" }))
      option(clock, "Minute", "45").focus()
      await userEvent.keyboard("{Enter}")
      await expectValue(canvasElement, "15:45", 3)
      await userEvent.keyboard("{Escape}")
      await expectClosed("Select time")
    })

    await step("B6 X empties the box", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Clear Time" }))
      await expectValue(canvasElement, "", 4)
    })

    await step(
      "C7 from an empty box: smaller units 0, first hour",
      async () => {
        const clock = await openPopup(opener, "Select time")
        await userEvent.click(option(clock, "Minute", "15"))
        await expectValue(canvasElement, "00:15", 5)
        await userEvent.keyboard("{Escape}")
        await expectClosed("Select time")
      }
    )

    if (!browserTools()) {
      return
    }

    await step("B1 a complete time typed", async () => {
      await typeKeys(canvas.getByLabelText("Time"), "1005P")
      await expectValue(canvasElement, "22:05")
    })
  },
}

export const Range: Story = {
  render: () => (
    <Controlled initial={range}>
      {(props) => <DatePicker type="time" range {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("T2 a From field and a To field with clocks", async () => {
      await expect(canvas.getByLabelText("From")).toHaveValue("22:00")
      await expect(canvas.getByLabelText("To")).toHaveValue("06:00")
      await expect(
        canvas.getByRole("button", { name: "Select time, From" })
      ).toBeVisible()
      await expect(
        canvas.getByRole("button", { name: "Select time, To" })
      ).toBeVisible()
    })

    await step("T3 never reordered", async () => {
      const clock = await openPopup(
        canvas.getByRole("button", { name: "Select time, From" }),
        "Select time, From"
      )
      const hour12 = clock.queryByRole("group", { name: "AM or PM" }) !== null
      await userEvent.click(option(clock, "Hour", hour12 ? "11" : "23"))
      await expectValue(canvasElement, ["23:00", "06:00"], 1)
      await userEvent.keyboard("{Escape}")
      await expectClosed("Select time, From")
      await userEvent.click(canvas.getByLabelText("value"))
      await expectValue(canvasElement, ["23:00", "06:00"], 1)
    })

    await step("B6 X on each end", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Clear From" }))
      await expectValue(canvasElement, ["", "06:00"], 2)
      await userEvent.click(canvas.getByRole("button", { name: "Clear To" }))
      await expectValue(canvasElement, ["", ""], 3)
    })
  },
}
