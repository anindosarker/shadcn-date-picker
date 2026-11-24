import * as React from "react"
import type { RangeValue } from "@/components/date-picker/types"

type PickerValue = string | RangeValue

type Widened<Value extends PickerValue> = Value extends string
  ? string
  : RangeValue

type ControlledProps<Value extends PickerValue> = {
  initial: Value
  children: (props: {
    value: Widened<Value>
    onChange: (value: Widened<Value>) => void
  }) => React.ReactNode
}

const show = (value: PickerValue) => JSON.stringify(value)

/** Holds the picker's value and lists every `onChange` call under it. */
function Controlled<Value extends PickerValue>({
  initial,
  children,
}: ControlledProps<Value>) {
  const [value, setValue] = React.useState(initial as Widened<Value>)
  const [calls, setCalls] = React.useState<Widened<Value>[]>([])
  return (
    <div className="flex flex-col items-start gap-4">
      {children({
        value,
        onChange: (next) => {
          setValue(next)
          setCalls((list) => [...list, next])
        },
      })}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm text-muted-foreground">
        <dt>value</dt>
        <dd>
          <output aria-label="value">{show(value)}</output>
        </dd>
        <dt>onChange calls</dt>
        <dd>
          <output aria-label="calls">{calls.length}</output>
        </dd>
        <dt>last call</dt>
        <dd>
          <output aria-label="last call">
            {calls.length ? show(calls[calls.length - 1]) : ""}
          </output>
        </dd>
      </dl>
    </div>
  )
}

export { Controlled }
