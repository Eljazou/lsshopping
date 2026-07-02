import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CATEGORY_KEYS } from '../../data/categories'
import { uploadProductImage } from '../../services/dataService'
import { useToast } from '../../context/ToastContext'
import ProductImage from '../../components/ui/ProductImage'
import Spinner from '../../components/ui/Spinner'
import { CloseIcon } from '../../components/ui/icons'

const EMPTY = {
  name: { en: '', fr: '', ar: '' },
  description: { en: '', fr: '', ar: '' },
  price: '',
  category: 'skincare',
  imageUrl: '',
  stock: '',
  featured: false,
}

export default function ProductFormModal({ open, initial, onClose, onSave }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState('fr')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ...EMPTY,
              ...initial,
              name: { ...EMPTY.name, ...(initial.name || {}) },
              description: { ...EMPTY.description, ...(initial.description || {}) },
            }
          : EMPTY
      )
      setImageFile(null)
      setImagePreview(initial?.imageUrl || '')
      setTab('fr')
    }
  }, [open, initial])

  if (!open) return null

  const setLocalized = (field, lang) => (e) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: e.target.value } }))

  const setPlain = (key, transform = (v) => v) => (e) =>
    setForm((f) => ({ ...f, [key]: transform(e.target.value) }))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadProductImage(imageFile, initial?.id)
        setUploading(false)
      }
      const payload = {
        ...form,
        imageUrl,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      }
      await onSave(payload)
    } catch (err) {
      console.error(err)
      toast(t('admin.uploadFailed'), 'error')
      setUploading(false)
    } finally {
      setSaving(false)
    }
  }

  const LANGS = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'ع' },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blush-100 bg-white px-6 py-4">
          <h2 className="font-display text-xl font-semibold">
            {initial ? t('admin.editProduct') : t('admin.addProduct')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-blush-50"
            aria-label={t('common.close')}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 p-6">
          {/* language tabs for localized fields */}
          <div>
            <div className="mb-3 inline-flex rounded-full bg-blush-50 p-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setTab(l.code)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    tab === l.code ? 'bg-white text-plum-600 shadow-sm' : 'text-ink/50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div dir={tab === 'ar' ? 'rtl' : 'ltr'}>
              <label className="label">
                {t(`admin.name${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
              </label>
              <input
                value={form.name[tab]}
                onChange={setLocalized('name', tab)}
                className="input mb-3"
                required={tab === 'fr'}
              />
              <label className="label">
                {t(`admin.desc${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
              </label>
              <textarea
                rows={3}
                value={form.description[tab]}
                onChange={setLocalized('description', tab)}
                className="input resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('admin.productPrice')} (DH)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={setPlain('price')}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">{t('admin.productStock')}</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={setPlain('stock')}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">{t('admin.productCategory')}</label>
              <select
                value={form.category}
                onChange={setPlain('category')}
                className="input cursor-pointer"
              >
                {CATEGORY_KEYS.map((c) => (
                  <option key={c} value={c}>
                    {t(`categories.${c}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 pb-3">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-plum-500"
                />
                <span className="text-sm">★ {t('home.featuredTitle')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">{t('admin.productImage')}</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                <ProductImage
                  src={imagePreview}
                  alt=""
                  label={form.name.fr || form.name.en}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline !py-2 text-sm"
                >
                  {imagePreview ? t('admin.changeImage') : t('admin.uploadImage')}
                </button>
                <p className="mt-1 text-xs text-ink/40">{t('admin.imageHint')}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              {t('admin.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <>
                  <Spinner className="h-5 w-5" />
                  {uploading ? t('admin.uploading') : t('admin.save')}
                </>
              ) : (
                t('admin.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
