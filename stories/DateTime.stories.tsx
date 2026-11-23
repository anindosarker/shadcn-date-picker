import type { Meta, StoryObj } from "@storybook/react-vite"
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
  expectValue,
  openPopup,
  realKeys,
  screen,
  today,
  todayButton,
  typeKeys,
} from "./support/play"

const meta = { title: "Types/DateTime" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const range: RangeValue = ["2026-11-03T09:00", "2026-11-12T17:00"]

export const Single: Story = {
  render: () => (
    <Controlled initial="2026-11-21T10:30">
      {(props) => <DatePicker type="datetime" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const opener = canvas.getByRole("button", { name: "Select date and time" })
    const popupName = "Select date and time"

    await step("DT1 closed: date-time box, X, calendar button", async () => {
      await expect(canvas.getByLabelText("Date and time")).toHaveValue(
        "2026-11-21T10:30"
      )
      await expect(
        canvas.getByRole("button", { name: "Clear Date and time" })
      ).toBeVisible()
      await expect(opener).toBeVisible()
    })

    await step("DT2, DT9 popup: calendar and a Time field, no X", async () => {
      const panel = await openPopup(opener, popupName)
      await expect(
        panel.getByRole("combobox", { name: "Choose the Month" })
      ).toHaveDisplayValue("Nov")
      await expect(panel.getByLabelText("Time")).toHaveValue("10:30")
      await expect(
        panel.getByRole("button", { name: "Select time" })
      ).toBeVisible()
      await expect(
        panel.queryByRole("button", { name: "Clear Time" })
      ).toBeNull()
    })

    await step("DT4 a day keeps the value's time, popup open", async () => {
      const panel = within(screen.getByRole("dialog", { name: popupName }))
      await userEvent.click(day(panel, "November 10th, 2026"))
      await expectValue(canvasElement, "2026-11-10T10:30", 1)
      await expect(
        screen.getByRole("dialog", { name: popupName })
      ).toBeVisible()
    })

    await step("U3, C2 the clock opens over the popup", async () => {
      const panel = within(screen.getByRole("dialog", { name: popupName }))
      const clock = await openPopup(
        panel.getByRole("button", { name: "Select time" }),
        "Select time"
      )
      await expect(
        screen.getByRole("dialog", { name: "Select time" })
      ).toHaveFocus()
      await expect(
        screen.getByRole("dialog", { name: popupName })
      ).toBeVisible()
      await userEvent.click(
        within(clock.getByRole("group", { name: "Hour" })).getByRole("button", {
          name: "9",
        })
      )
      await expectValue(canvasElement, "2026-11-10T09:30", 2)
      await expect(
        screen.getByRole("dialog", { name: "Select time" })
      ).toBeVisible()
    })

    await step(
      "DT6, DT3 no value: Time field disabled; a day gets 00:00",
      async () => {
        await userEvent.keyboard("{Escape}")
        await expectClosed("Select time")
        await userEvent.keyboard("{Escape}")
        await expectClosed(popupName)
        await userEvent.click(
          canvas.getByRole("button", { name: "Clear Date and time" })
        )
        await expectValue(canvasElement, "", 3)
        const panel = await openPopup(opener, popupName)
        await expect(panel.getByLabelText("Time")).toBeDisabled()
        await expect(
          panel.getByRole("button", { name: "Select time" })
        ).toBeDisabled()
        await userEvent.click(todayButton(panel))
        await expectValue(canvasElement, `${today()}T00:00`, 4)
        await expect(
          screen.getByRole("dialog", { name: popupName })
        ).toBeVisible()
        await expect(panel.getByLabelText("Time")).toBeEnabled()
      }
    )

    if (!browserTools()) {
      return
    }

    await step("DT7 a typed time joins the date", async () => {
      const panel = within(screen.getByRole("dialog", { name: popupName }))
      await typeKeys(panel.getByLabelText("Time"), "0945A")
      await expectValue(canvasElement, `${today()}T09:45`)
    })

    await step("DT8 a half-deleted time changes nothing", async () => {
      const calls = callCount(canvasElement)
      await realKeys("{Backspace}")
      const panel = within(screen.getByRole("dialog", { name: popupName }))
      await waitFor(() => expect(panel.getByLabelText("Time")).toHaveValue(""))
      await expectValue(canvasElement, `${today()}T09:45`, calls)
    })
  },
}

export const Range: Story = {
  render: () => (
    <Controlled initial={range}>
      {(props) => <DatePicker type="datetime" range {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const popupName = "Date and time range"
    const trigger = canvas.getByRole("button", { name: /^Nov 3, 2026/ })

    await step("R1 closed: the two ends as text", async () => {
      await expect(trigger).toHaveTextContent(
        /^Nov 3, 2026 9:00\sAM - Nov 12, 2026 5:00\sPM$/
      )
    })

    await step(
      "R3 popup: From and To date-time boxes with clocks",
      async () => {
        const panel = await openPopup(trigger, popupName)
        await expect(panel.getByLabelText("From")).toHaveValue(
          "2026-11-03T09:00"
        )
        await expect(panel.getByLabelText("To")).toHaveValue("2026-11-12T17:00")
        await expect(
          panel.getByRole("button", { name: "Select time, From" })
        ).toBeEnabled()
        await expect(
          panel.getByRole("button", { name: "Select time, To" })
        ).toBeEnabled()
      }
    )

    await step("R8 a new day gets the first or the last time", async () => {
      const panel = within(screen.getByRole("dialog", { name: popupName }))
      await userEvent.click(day(panel, "November 1st, 2026"))
      await expectValue(
        canvasElement,
        ["2026-11-01T00:00", "2026-11-12T17:00"],
        1
      )
      await userEvent.click(day(panel, "November 20th, 2026"))
      await expectValue(
        canvasElement,
        ["2026-11-01T00:00", "2026-11-20T23:59"],
        2
      )
    })

    await step("R20 an end's clock replaces that end's time", async () => {
      const panel = within(screen.getByRole("dialog", { name: popupName }))
      const clock = await openPopup(
        panel.getByRole("button", { name: "Select time, From" }),
        "Select time, From"
      )
      await userEvent.click(
        within(clock.getByRole("group", { name: "Hour" })).getByRole("button", {
          name: "10",
        })
      )
      await expectValue(
        canvasElement,
        ["2026-11-01T10:00", "2026-11-20T23:59"],
        3
      )
      await userEvent.keyboard("{Escape}")
      await expectClosed("Select time, From")
    })

    await step(
      "R2, R20 cleared: an empty end's clock is disabled",
      async () => {
        if (screen.queryByRole("dialog", { name: popupName })) {
          await userEvent.keyboard("{Escape}")
          await expectClosed(popupName)
        }
        await userEvent.click(
          canvas.getByRole("button", { name: "Clear Date and time range" })
        )
        await expectValue(canvasElement, ["", ""], 4)
        const empty = canvas.getByRole("button", {
          name: "Pick a date and time range",
        })
        await expect(empty).toHaveFocus()
        const panel = await openPopup(empty, popupName)
        await expect(
          panel.getByRole("button", { name: "Select time, From" })
        ).toBeDisabled()
      }
    )

    if (!browserTools()) {
      return
    }

    await step(
      "R16 opening an end's clock orders a reversed pair, then edits that end",
      async () => {
        const panel = within(screen.getByRole("dialog", { name: popupName }))
        await typeKeys(
          panel.getByLabelText("From"),
          `${await dateKeys("2026-11-20")}1000A`
        )
        await expectValue(canvasElement, ["2026-11-20T10:00", ""])
        await typeKeys(
          panel.getByLabelText("To"),
          `${await dateKeys("2026-11-05")}0800A`
        )
        await expectValue(canvasElement, [
          "2026-11-20T10:00",
          "2026-11-05T08:00",
        ])
        const calls = callCount(canvasElement)
        const clock = await openPopup(
          panel.getByRole("button", { name: "Select time, To" }),
          "Select time, To"
        )
        await expectValue(
          canvasElement,
          ["2026-11-05T08:00", "2026-11-20T10:00"],
          calls + 1
        )
        const nine = clock.queryByRole("group", { name: "AM or PM" })
          ? "9"
          : "09"
        await userEvent.click(
          within(clock.getByRole("group", { name: "Hour" })).getByRole(
            "button",
            {
              name: nine,
            }
          )
        )
        await expectValue(
          canvasElement,
          ["2026-11-05T08:00", "2026-11-20T09:00"],
          calls + 2
        )
      }
    )
  },
}
