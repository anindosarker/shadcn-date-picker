import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test"
import { DatePicker } from "@/components/date-picker/date-picker"
import type { RangeValue } from "@/components/date-picker/types"
import { Controlled } from "./support/controlled"
import {
  browserTools,
  dateKeys,
  day,
  expectClosed,
  expectGone,
  expectRangeClosed,
  expectValue,
  openPopup,
  openRangePopup,
  rangeDialog,
  readDateOrder,
  realKeys,
  screen,
  typeKeys,
} from "./support/play"

const meta = { title: "Options" } satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const week: RangeValue = ["2026-W44", "2026-W47"]

const shift: RangeValue = ["22:00", "06:00"]

const november: RangeValue = ["2026-11-03", "2026-11-12"]

const noonRange: RangeValue = ["2026-11-10T12:00", "2026-11-20T12:00"]

function option(
  scope: ReturnType<typeof within>,
  column: string,
  name: string
) {
  return within(scope.getByRole("group", { name: column })).getByRole(
    "button",
    { name }
  )
}

export const Disabled: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => <DatePicker type="date" disabled {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("G2 box and calendar button disabled, no X", async () => {
      await expect(canvas.getByLabelText("Date")).toBeDisabled()
      await expect(
        canvas.getByRole("button", { name: "Select date" })
      ).toBeDisabled()
      await expectGone(canvasElement, "Clear Date")
      await expectValue(canvasElement, "2026-11-21", 0)
    })
  },
}

export const DisabledRange: Story = {
  render: () => (
    <Controlled initial={november}>
      {(props) => <DatePicker type="date" range disabled {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("G2 trigger disabled, no X", async () => {
      await expect(
        canvas.getByRole("button", { name: "Nov 3, 2026 - Nov 12, 2026" })
      ).toBeDisabled()
      await expectGone(canvasElement, "Clear Date range")
    })
  },
}

export const Limits: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => (
        <DatePicker type="date" min="2026-11-05" max="2026-11-25" {...props} />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await readDateOrder()
    const opener = canvas.getByRole("button", { name: "Select date" })

    await step(
      "D6 a day outside the limits is greyed and does nothing",
      async () => {
        const panel = await openPopup(opener, "Select date")
        const outside = day(panel, "November 3rd, 2026")
        await expect(outside).toBeDisabled()
        await userEvent.click(outside, { pointerEventsCheck: 0 })
        await expectValue(canvasElement, "2026-11-21", 0)
      }
    )

    await step("D7 the year list ends at the limits", async () => {
      const panel = within(screen.getByRole("dialog", { name: "Select date" }))
      const years = panel.getByRole("combobox", { name: "Choose the Year" })
      await expect(
        within(years)
          .getAllByRole("option")
          .map((year) => year.textContent)
      ).toEqual(["2026"])
    })

    await step(
      "D11 an arrow at the end is dimmed, stays a tab stop",
      async () => {
        const panel = within(
          screen.getByRole("dialog", { name: "Select date" })
        )
        const previous = panel.getByRole("button", {
          name: "Go to the Previous Month",
        })
        await expect(previous).toHaveAttribute("aria-disabled", "true")
        previous.focus()
        await expect(previous).toHaveFocus()
        await userEvent.click(previous)
        await expect(
          panel.getByRole("combobox", { name: "Choose the Month" })
        ).toHaveDisplayValue("Nov")
        await userEvent.keyboard("{Escape}")
        await expectClosed("Select date")
      }
    )

    if (!browserTools()) {
      return
    }

    await step("B3, N3 a typed date outside the limits is kept", async () => {
      await typeKeys(canvas.getByLabelText("Date"), dateKeys("2026-12-01"))
      await expectValue(canvasElement, "2026-12-01")
    })
  },
}

function yearOptions(panel: ReturnType<typeof within>) {
  return within(panel.getByRole("combobox", { name: "Choose the Year" }))
    .getAllByRole("option")
    .map((year) => year.textContent)
}

export const MaxBeforeList: Story = {
  render: () => (
    <Controlled initial="1850-03-10">
      {(props) => <DatePicker type="date" max="1850-06-15" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "D8 only a max before 1900: the list runs up to it",
      async () => {
        const panel = await openPopup(
          canvas.getByRole("button", { name: "Select date" }),
          "Select date"
        )
        const years = yearOptions(panel)
        await expect(years[0]).toBe("1800")
        await expect(years.at(-1)).toBe("1850")
        await expect(years).toHaveLength(51)
      }
    )
  },
}

export const MinAfterList: Story = {
  render: () => (
    <Controlled initial="2260-05-01">
      {(props) => <DatePicker type="date" min="2250-03-10" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("D8 only a min after 2100: the list runs from it", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select date" }),
        "Select date"
      )
      const years = yearOptions(panel)
      await expect(years[0]).toBe("2250")
      await expect(years.at(-1)).toBe("2300")
      await expect(years).toHaveLength(51)
    })
  },
}

export const YearOutsideList: Story = {
  render: () => (
    <Controlled initial="2100">
      {(props) => <DatePicker type="year" min="2000" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "P13 a year past the list but inside the limits is not greyed",
      async () => {
        const panel = await openPopup(
          canvas.getByRole("button", { name: "Select year" }),
          "Select year"
        )
        const grid = within(panel.getByRole("group", { name: "2100 – 2109" }))
        await expect(grid.getByRole("button", { name: "2105" })).toBeEnabled()
        await userEvent.click(grid.getByRole("button", { name: "2105" }))
        await expectClosed("Select year")
        await expectValue(canvasElement, "2105", 1)
      }
    )
  },
}

export const MonthLimits: Story = {
  render: () => (
    <Controlled initial="2026-06">
      {(props) => (
        <DatePicker type="month" min="2026-03" max="2026-10" {...props} />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("P12 a month outside the limits is greyed", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select month" }),
        "Select month"
      )
      const grid = within(panel.getByRole("group", { name: "2026" }))
      await expect(grid.getByRole("button", { name: "Feb" })).toBeDisabled()
      await expect(grid.getByRole("button", { name: "Nov" })).toBeDisabled()
      await expect(grid.getByRole("button", { name: "Mar" })).toBeEnabled()
    })
  },
}

export const TimeLimits: Story = {
  render: () => (
    <Controlled initial="">
      {(props) => <DatePicker type="time" min="13:30" max="17:00" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("C5, C6 options outside the limits greyed", async () => {
      const clock = await openPopup(
        canvas.getByRole("button", { name: "Select time" }),
        "Select time"
      )
      if (clock.queryByRole("group", { name: "AM or PM" })) {
        await expect(option(clock, "AM or PM", "AM")).toBeDisabled()
        await expect(option(clock, "AM or PM", "PM")).toBeEnabled()
      }
      await expect(option(clock, "Minute", "00")).toBeDisabled()
      await expect(option(clock, "Minute", "30")).toBeEnabled()
    })
    await step(
      "C7 a pick from empty is brought inside the limits",
      async () => {
        const clock = within(
          screen.getByRole("dialog", { name: "Select time" })
        )
        await userEvent.click(option(clock, "Minute", "45"))
        await expectValue(canvasElement, "13:45", 1)
      }
    )
  },
}

export const DateTimeLimits: Story = {
  render: () => (
    <Controlled initial="2026-11-10T08:00">
      {(props) => (
        <DatePicker
          type="datetime"
          min="2026-11-05T09:10"
          max="2026-11-25T17:00"
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("DT5 a click on min's day brings the time inside", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select date and time" }),
        "Select date and time"
      )
      await userEvent.click(day(panel, "November 5th, 2026"))
      await expectValue(canvasElement, "2026-11-05T09:10", 1)
      await userEvent.click(day(panel, "November 25th, 2026"))
      await expectValue(canvasElement, "2026-11-25T09:10", 2)
    })
    await step(
      "DT10 min's time limits the clock only on min's day",
      async () => {
        const panel = within(
          screen.getByRole("dialog", { name: "Select date and time" })
        )
        await userEvent.click(day(panel, "November 5th, 2026"))
        await expectValue(canvasElement, "2026-11-05T09:10", 3)
        const opener = panel.getByRole("button", { name: "Select time" })
        let clock = await openPopup(opener, "Select time")
        const early = clock.queryByRole("group", { name: "AM or PM" })
          ? "8"
          : "08"
        await expect(option(clock, "Hour", early)).toBeDisabled()
        await userEvent.keyboard("{Escape}")
        await expectClosed("Select time")
        await userEvent.click(day(panel, "November 10th, 2026"))
        await expectValue(canvasElement, "2026-11-10T09:10", 4)
        clock = await openPopup(opener, "Select time")
        await expect(option(clock, "Hour", early)).toBeEnabled()
      }
    )
  },
}

export const DateTimeRangeLimits: Story = {
  render: () => (
    <Controlled initial={noonRange}>
      {(props) => (
        <DatePicker
          type="datetime"
          range
          min="2026-11-05T09:10"
          max="2026-11-25T17:00"
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "R9 a picked min or max day brings that end's time inside",
      async () => {
        const panel = await openRangePopup(
          canvas.getByRole("button", { name: /^Nov 10, 2026/ })
        )
        await userEvent.click(day(panel, "November 5th, 2026"))
        await expectValue(
          canvasElement,
          ["2026-11-05T09:10", "2026-11-20T12:00"],
          1
        )
        await userEvent.click(day(panel, "November 25th, 2026"))
        await expectValue(
          canvasElement,
          ["2026-11-05T09:10", "2026-11-25T17:00"],
          2
        )
      }
    )
  },
}

export const Step: Story = {
  render: () => (
    <Controlled initial="10:30">
      {(props) => <DatePicker type="time" step={900} {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("C3 step 900: minutes 00, 15, 30, 45", async () => {
      const clock = await openPopup(
        canvas.getByRole("button", { name: "Select time" }),
        "Select time"
      )
      const minutes = within(clock.getByRole("group", { name: "Minute" }))
        .getAllByRole("button")
        .map((minute) => minute.textContent)
      await expect(minutes).toEqual(["00", "15", "30", "45"])
      await expect(clock.queryByRole("group", { name: "Second" })).toBeNull()
    })
  },
}

export const StepTyped: Story = {
  render: () => (
    <Controlled initial="10:30">
      {(props) => <DatePicker type="time" step={900} {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    if (!browserTools()) {
      return
    }
    await step("B4, N4 a typed time off the step is kept", async () => {
      await typeKeys(canvas.getByLabelText("Time"), "1007A")
      await expectValue(canvasElement, "10:07")
    })
  },
}

export const OpenState: Story = {
  render: () => (
    <Controlled initial="10:30">
      {(props) => (
        <DatePicker
          type="time"
          popoverProps={{ defaultOpen: true }}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    await step(
      "U8, T5 the open state passes through popoverProps",
      async () => {
        const clock = await screen.findByRole("dialog", { name: "Select time" })
        await waitFor(() => expect(clock).toBeVisible())
        await userEvent.keyboard("{Escape}")
        await expectClosed("Select time")
        await expectValue(canvasElement, "10:30", 0)
      }
    )
  },
}

export const StepSeconds: Story = {
  render: () => (
    <Controlled initial="10:30">
      {(props) => <DatePicker type="time" step={90} {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("C3 a step that is not whole minutes adds seconds", async () => {
      const clock = await openPopup(
        canvas.getByRole("button", { name: "Select time" }),
        "Select time"
      )
      await expect(clock.getByRole("group", { name: "Second" })).toBeVisible()
    })
  },
}

export const DateTimeStep: Story = {
  render: () => (
    <Controlled initial="">
      {(props) => (
        <DatePicker
          type="datetime"
          step={900}
          min="2026-11-01T09:10"
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "DT3, DT11 the first time on the step from min's time",
      async () => {
        const panel = await openPopup(
          canvas.getByRole("button", { name: "Select date and time" }),
          "Select date and time"
        )
        await userEvent.selectOptions(
          panel.getByRole("combobox", { name: "Choose the Year" }),
          "2026"
        )
        await userEvent.selectOptions(
          panel.getByRole("combobox", { name: "Choose the Month" }),
          "10"
        )
        await userEvent.click(day(panel, "November 16th, 2026"))
        await expectValue(canvasElement, "2026-11-16T00:10", 1)
        const clock = await openPopup(
          panel.getByRole("button", { name: "Select time" }),
          "Select time"
        )
        const minutes = within(clock.getByRole("group", { name: "Minute" }))
          .getAllByRole("button")
          .map((minute) => minute.textContent)
        await expect(minutes).toEqual(["10", "25", "40", "55"])
        await userEvent.click(option(clock, "Minute", "25"))
        await expectValue(canvasElement, "2026-11-16T00:25", 2)
      }
    )
  },
}

export const Labels: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => (
        <DatePicker
          type="date"
          labels={{
            date: "Datum",
            selectDate: "Datum wählen",
            clear: (name) => `${name} leeren`,
          }}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("G5 the picker's words replaced key by key", async () => {
      await expect(canvas.getByLabelText("Datum")).toHaveValue("2026-11-21")
      await expect(
        canvas.getByRole("button", { name: "Datum leeren" })
      ).toBeVisible()
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Datum wählen" }),
        "Datum wählen"
      )
      await expect(
        panel.getByRole("button", { name: "Go to today" })
      ).toBeVisible()
    })
  },
}

export const Presets: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => (
        <DatePicker
          type="date"
          presets={[
            { label: "New Year", value: "2027-01-01" },
            { label: "Christmas", value: "2026-12-25" },
          ]}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("D9 a preset moves the calendar, popup stays open", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select date" }),
        "Select date"
      )
      await userEvent.click(panel.getByRole("button", { name: "Christmas" }))
      await expectValue(canvasElement, "2026-12-25", 1)
      await expect(
        panel.getByRole("combobox", { name: "Choose the Month" })
      ).toHaveDisplayValue("Dec")
      await waitFor(() =>
        expect(
          screen.getByRole("dialog", { name: "Select date" })
        ).toBeVisible()
      )
    })
  },
}

export const WeekPresets: Story = {
  render: () => (
    <Controlled initial="2026-W47">
      {(props) => (
        <DatePicker
          type="week"
          presets={[{ label: "First week of 2027", value: "2027-W01" }]}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("P17 a week preset moves the calendar, popup open", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select week" }),
        "Select week"
      )
      await userEvent.click(
        panel.getByRole("button", { name: "First week of 2027" })
      )
      await expectValue(canvasElement, "2027-W01", 1)
      await expect(
        panel.getByRole("combobox", { name: "Choose the Month" })
      ).toHaveDisplayValue("Jan")
      await expect(
        panel.getByRole("combobox", { name: "Choose the Year" })
      ).toHaveDisplayValue("2027")
      await waitFor(() =>
        expect(
          screen.getByRole("dialog", { name: "Select week" })
        ).toBeVisible()
      )
    })
  },
}

export const MonthPresets: Story = {
  render: () => (
    <Controlled initial="2026-11">
      {(props) => (
        <DatePicker
          type="month"
          presets={[{ label: "Spring 2027", value: "2027-03" }]}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("P17 a month preset moves the grid, popup open", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select month" }),
        "Select month"
      )
      await userEvent.click(panel.getByRole("button", { name: "Spring 2027" }))
      await expectValue(canvasElement, "2027-03", 1)
      const grid = within(await panel.findByRole("group", { name: "2027" }))
      await expect(grid.getByRole("button", { name: "Mar" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      await waitFor(() =>
        expect(
          screen.getByRole("dialog", { name: "Select month" })
        ).toBeVisible()
      )
    })
  },
}

export const YearPresets: Story = {
  render: () => (
    <Controlled initial="2026">
      {(props) => (
        <DatePicker
          type="year"
          presets={[{ label: "Mission year", value: "2042" }]}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("P17 a year preset moves the grid, popup open", async () => {
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select year" }),
        "Select year"
      )
      await userEvent.click(panel.getByRole("button", { name: "Mission year" }))
      await expectValue(canvasElement, "2042", 1)
      const grid = within(
        await panel.findByRole("group", { name: "2040 – 2049" })
      )
      await expect(grid.getByRole("button", { name: "2042" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      await waitFor(() =>
        expect(
          screen.getByRole("dialog", { name: "Select year" })
        ).toBeVisible()
      )
    })
  },
}

export const RangePresets: Story = {
  render: () => (
    <Controlled initial={november}>
      {(props) => (
        <DatePicker
          type="date"
          range
          presets={[{ label: "Holidays", value: ["2026-12-20", "2027-01-03"] }]}
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "R18 a preset moves both calendars, popup stays open",
      async () => {
        const panel = await openRangePopup(
          canvas.getByRole("button", { name: "Nov 3, 2026 - Nov 12, 2026" })
        )
        await userEvent.click(panel.getByRole("button", { name: "Holidays" }))
        await expectValue(canvasElement, ["2026-12-20", "2027-01-03"], 1)
        const months = panel.getAllByRole<HTMLSelectElement>("combobox", {
          name: "Choose the Month",
        })
        await expect(months.map((select) => select.value)).toEqual(["11", "0"])
        await waitFor(() => expect(rangeDialog()).toBeVisible())
      }
    )
  },
}

export const InputAttributes: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => (
        <div className="flex flex-col gap-2">
          <label htmlFor="due" className="text-sm font-medium">
            Due date
          </label>
          <DatePicker
            type="date"
            id="due"
            aria-describedby="due-help"
            {...props}
          />
          <p id="due-help" className="text-sm text-muted-foreground">
            The day the invoice is due.
          </p>
        </div>
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "B10 the app's label names the box; the X keeps its noun",
      async () => {
        const box = canvas.getByLabelText("Due date")
        await expect(box).toHaveValue("2026-11-21")
        await expect(box).toHaveAccessibleDescription(
          "The day the invoice is due."
        )
        await expect(
          canvas.getByRole("button", { name: "Clear Date" })
        ).toBeVisible()
      }
    )
  },
}

export const TriggerName: Story = {
  render: () => (
    <Controlled initial={week}>
      {(props) => (
        <DatePicker type="week" range aria-label="Sprint" {...props} />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(
      "P16 the app's aria-label names the trigger and its X",
      async () => {
        const trigger = canvas.getByRole("button", { name: "Sprint" })
        await expect(trigger).toHaveTextContent("Week 44, 2026 - Week 47, 2026")
        await expect(
          canvas.getByRole("button", { name: "Clear Sprint" })
        ).toBeVisible()
        await openRangePopup(trigger)
      }
    )
  },
}

export const TimeRangeAttributes: Story = {
  render: () => (
    <Controlled initial={shift}>
      {(props) => (
        <DatePicker
          type="time"
          range
          id="shift"
          aria-label="Shift"
          {...props}
        />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("T4 the group is named, the boxes get the ids", async () => {
      const group = canvas.getByRole("group", { name: "Shift" })
      await expect(within(group).getByLabelText("From")).toHaveAttribute(
        "id",
        "shift"
      )
      await expect(within(group).getByLabelText("To")).toHaveAttribute(
        "id",
        "shift-to"
      )
    })
  },
}

export const Dialog: Story = {
  render: () => (
    <Controlled initial="2026-11-21">
      {(props) => <DatePicker type="date" presentation="dialog" {...props} />}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("U4, U9 a dialog: title, one X, Done", async () => {
      const dialog = await openPopup(
        canvas.getByRole("button", { name: "Select date" }),
        "Select date"
      )
      await expect(
        dialog.getByRole("heading", { name: "Select date" })
      ).toBeVisible()
      await expect(
        dialog.getAllByRole("button", { name: "Close" })
      ).toHaveLength(1)
      await userEvent.click(day(dialog, "November 10th, 2026"))
      await expectClosed("Select date")
      await expectValue(canvasElement, "2026-11-10", 1)
    })
    await step("U4 Done closes", async () => {
      const dialog = await openPopup(
        canvas.getByRole("button", { name: "Select date" }),
        "Select date"
      )
      await userEvent.click(dialog.getByRole("button", { name: "Done" }))
      await expectClosed("Select date")
    })
  },
}

export const PhoneLayout: Story = {
  render: () => (
    <Controlled initial={november}>
      {(props) => (
        <DatePicker type="date" range presentation="auto" {...props} />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await readDateOrder()
    const trigger = () =>
      canvas.getByRole("button", { name: /^Nov \d+, 2026 - Nov \d+, 2026$/ })
    const tools = browserTools()
    if (!tools) {
      return
    }

    await step("U6 a popover from 768 wide", async () => {
      const panel = await openRangePopup(trigger())
      await expect(panel.queryByRole("button", { name: "Done" })).toBeNull()
      await userEvent.keyboard("{Escape}")
      await expectRangeClosed()
    })

    await step("U5, U6, R5 a full-screen dialog under 768 wide", async () => {
      await tools.page.viewport(390, 844)
      const dialog = await openRangePopup(trigger())
      await expect(dialog.getByLabelText("From")).toHaveValue("2026-11-03")
      await expect(dialog.getByLabelText("To")).toHaveValue("2026-11-12")
      await expect(dialog.getAllByText("From")).toHaveLength(2)
      await expect(dialog.getAllByText("To")).toHaveLength(2)
      await userEvent.click(day(dialog, "November 20th, 2026"))
      await expectValue(canvasElement, ["2026-11-03", "2026-11-20"], 1)
      await userEvent.click(dialog.getByRole("button", { name: "Done" }))
      await expectRangeClosed()
    })

    await step(
      "R15 Tab from box to box in the phone dialog never swaps",
      async () => {
        const dialog = await openRangePopup(trigger())
        await typeKeys(dialog.getByLabelText("From"), dateKeys("2026-11-25"))
        await expectValue(canvasElement, ["2026-11-25", "2026-11-20"])
        await realKeys("{Tab}{Tab}")
        await expect(dialog.getByLabelText("To")).toHaveFocus()
        await expectValue(canvasElement, ["2026-11-25", "2026-11-20"])
      }
    )

    await step("U7 the picker closes when the window crosses 768", async () => {
      await tools.page.viewport(1280, 800)
      await expectRangeClosed()
    })
  },
}

export const IgnoredLimits: Story = {
  beforeEach: () => {
    const spy = spyOn(console, "error").mockImplementation(() => {})
    return () => spy.mockRestore()
  },
  render: () => (
    <Controlled initial="2026-11-21T10:30">
      {(props) => (
        <DatePicker type="datetime" min="2026/11/05" step={1.5} {...props} />
      )}
    </Controlled>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("G3, G4 a limit or step off the format is ignored", async () => {
      await expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("DatePicker:")
      )
      const panel = await openPopup(
        canvas.getByRole("button", { name: "Select date and time" }),
        "Select date and time"
      )
      await expect(day(panel, "November 1st, 2026")).toBeEnabled()
    })
  },
}
