import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductImage from '../ui/ProductImage'
import { ArrowRight } from '../ui/icons'

export default function CategoryCard({ category }) {
  const { t } = useTranslation()
  const label = t(`categories.${category.key}`)

  return (
    <Link
      to={`/shop?category=${category.key}`}
      className="group relative flex aspect-square items-end overflow-hidden rounded-3xl shadow-card"
    >
      <ProductImage
        src={category.image}
        alt={label}
        label={label}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="relative z-10 flex w-full items-center justify-between p-5 text-white">
        <h3 className="font-display text-xl font-semibold sm:text-2xl">{label}</h3>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-gold rtl:rotate-180">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
