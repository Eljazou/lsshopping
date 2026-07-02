export default function Spinner({ className = 'h-6 w-6' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-plum-200 border-t-plum-500 ${className}`}
      role="status"
      aria-label="loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  )
}
