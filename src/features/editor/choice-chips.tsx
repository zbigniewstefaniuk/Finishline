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
    <div className="choice-chips" role="radiogroup" aria-label={label}>
      {values.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          className="choice-chip"
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}
