import ProductCard from './ProductCard'

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <div
          key={p.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}
