import { useState } from 'react'

// Renders a product image with a graceful, on-brand fallback: if the remote
// image fails to load (offline demo, dead URL, etc.), we show a soft gradient
// tile with the product's initial so the layout never breaks.
function fallbackDataUri(label = '') {
  const initial = (label.trim()[0] || 'É').toUpperCase()
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='480'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#ffe9f1'/>
        <stop offset='1' stop-color='#f0e9ff'/>
      </linearGradient>
    </defs>
    <rect width='400' height='480' fill='url(#g)'/>
    <text x='50%' y='50%' dy='.35em' text-anchor='middle'
      font-family='Georgia, serif' font-size='120' fill='#cbb0ff'>${initial}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function ProductImage({ src, alt, className = '', label }) {
  const [errored, setErrored] = useState(false)
  const finalSrc = errored || !src ? fallbackDataUri(label || alt) : src

  return (
    <img
      src={finalSrc}
      alt={alt || ''}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
    />
  )
}
