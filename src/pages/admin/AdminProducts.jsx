import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from '../../services/dataService'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, localized } from '../../utils/format'
import ProductImage from '../../components/ui/ProductImage'
import { PageLoader } from '../../components/ui/Spinner'
import { PlusIcon, TrashIcon, SearchIcon } from '../../components/ui/icons'
import ProductFormModal from './ProductFormModal'

export default function AdminProducts() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    getProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (product) => {
    setEditing(product)
    setModalOpen(true)
  }

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await updateProduct(editing.id, payload)
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p))
        )
        toast(t('admin.save'))
      } else {
        const created = await addProduct(payload)
        setProducts((prev) => [created, ...prev])
        toast(t('admin.addProduct'))
      }
      setModalOpen(false)
    } catch {
      toast('Save failed', 'error')
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return
    const prev = products
    setProducts((p) => p.filter((x) => x.id !== product.id))
    try {
      await deleteProduct(product.id)
      deleteProductImage(product.imageUrl)
      toast(t('admin.delete'))
    } catch {
      setProducts(prev)
      toast('Delete failed', 'error')
    }
  }

  const filtered = products.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return Object.values(p.name || {}).join(' ').toLowerCase().includes(q)
  })

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center rounded-full border border-plum-100 bg-white px-4 sm:w-72">
          <SearchIcon className="h-4 w-4 text-plum-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('nav.search')}
            className="w-full bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-plum-300"
          />
        </div>
        <button onClick={openAdd} className="btn-primary">
          <PlusIcon className="h-5 w-5" />
          {t('admin.addProduct')}
        </button>
      </div>

      <p className="mb-4 text-sm text-ink/50">
        {t('shop.resultsCount', { count: filtered.length })}
      </p>

      {/* desktop table */}
      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-blush-50/60">
            <tr className="text-start text-xs uppercase tracking-wider text-ink/50">
              <th className="p-4 text-start font-medium">{t('admin.productName')}</th>
              <th className="p-4 text-start font-medium">{t('admin.productCategory')}</th>
              <th className="p-4 text-start font-medium">{t('admin.productPrice')}</th>
              <th className="p-4 text-start font-medium">{t('admin.productStock')}</th>
              <th className="p-4 text-end font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-50">
            {filtered.map((p) => (
              <tr key={p.id} className="transition hover:bg-blush-50/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                      <ProductImage
                        src={p.imageUrl}
                        alt={localized(p.name, language)}
                        label={localized(p.name, language)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{localized(p.name, language)}</p>
                      {p.featured && (
                        <span className="text-xs text-gold-dark">★ {t('home.featuredTitle')}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-ink/60">{t(`categories.${p.category}`)}</td>
                <td className="p-4 font-semibold text-blush-600">
                  {formatPrice(p.price, language)}
                </td>
                <td className="p-4">
                  <span
                    className={`badge ${
                      p.stock <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : p.stock <= 5
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-full border border-plum-100 px-3 py-1.5 text-xs font-medium text-plum-600 transition hover:bg-plum-50"
                    >
                      {t('admin.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 text-rose-500 transition hover:bg-rose-50"
                      aria-label={t('admin.delete')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
        {filtered.map((p) => (
          <div key={p.id} className="card flex gap-3 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blush-50">
              <ProductImage
                src={p.imageUrl}
                alt={localized(p.name, language)}
                label={localized(p.name, language)}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <p className="line-clamp-1 font-medium">{localized(p.name, language)}</p>
              <p className="text-xs text-ink/50">{t(`categories.${p.category}`)}</p>
              <p className="mt-1 text-sm font-semibold text-blush-600">
                {formatPrice(p.price, language)}
              </p>
              <p className="text-xs text-ink/50">Stock: {p.stock}</p>
              <div className="mt-auto flex gap-2 pt-2">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 rounded-full border border-plum-100 py-1.5 text-xs font-medium text-plum-600"
                >
                  {t('admin.edit')}
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="rounded-full border border-rose-100 px-3 py-1.5 text-rose-500"
                  aria-label={t('admin.delete')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
