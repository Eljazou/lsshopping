import { PlusIcon, MinusIcon } from './icons'

export default function QuantitySelector({ value, onChange, min = 1, max = 99, size = 'md' }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))
  const btn =
    size === 'sm'
      ? 'h-8 w-8'
      : 'h-11 w-11'

  return (
    <div className="inline-flex items-center rounded-full border border-plum-100 bg-white">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="decrease quantity"
        className={`${btn} flex items-center justify-center rounded-full text-plum-600 transition hover:bg-plum-50 disabled:opacity-30`}
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="increase quantity"
        className={`${btn} flex items-center justify-center rounded-full text-plum-600 transition hover:bg-plum-50 disabled:opacity-30`}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
