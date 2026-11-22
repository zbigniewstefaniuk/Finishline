import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

export function ChoiceChips<Value extends string>({
  values,
  labels,
  value,
  label,
  onChange,
}: {
  values: readonly Value[]
  labels: Record<Value, string>
  value: Value
  label: string
  onChange: (value: Value) => void
}) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      className="flex-wrap"
      value={[value]}
      onValueChange={(next: unknown[]) => {
        const picked = values.find((option) => next.includes(option))
        if (picked) onChange(picked)
      }}
    >
      {values.map((option) => (
        <ToggleGroupItem key={option} value={option} className="h-9 px-3.5">
          {labels[option]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
