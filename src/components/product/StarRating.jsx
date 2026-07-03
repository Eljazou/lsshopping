import { StarIcon } from '../ui/icons'

// Read-only display (value can be fractional, e.g. an average like 4.3) or,
// with `onChange`, an interactive 1-5 picker for the review form.
export default function StarRating({ value = 0, onChange, size = 'h-4 w-4' }) {
  const stars = [1, 2, 3, 4, 5]
  const interactive = typeof onChange === 'function'

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((n) => {
        const filled = n <= Math.round(value)
        const Tag = interactive ? 'button' : 'span'
        return (
          <Tag
            key={n}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange(n) : undefined}
            aria-label={interactive ? `${n} / 5` : undefined}
            className={`${filled ? 'text-gold' : 'text-blush-200'} ${
              interactive ? 'transition hover:scale-110' : ''
            }`}
          >
            <StarIcon className={size} />
          </Tag>
        )
      })}
    </div>
  )
}
