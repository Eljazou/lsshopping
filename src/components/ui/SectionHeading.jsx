// Centered section heading with a gold divider — used across the storefront.
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-start'
  return (
    <div className={`mb-10 flex flex-col ${alignment}`}>
      {eyebrow && (
        <span className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-plum-500">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
      <span className="gold-divider my-4" />
      {subtitle && (
        <p className="max-w-xl text-sm text-ink/60 sm:text-base">{subtitle}</p>
      )}
    </div>
  )
}
