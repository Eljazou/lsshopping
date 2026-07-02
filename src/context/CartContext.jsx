import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'eclat_cart'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity } = action
      const existing = state.find((i) => i.id === product.id)
      const max = product.stock ?? 99
      if (existing) {
        return state.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, max) }
            : i
        )
      }
      return [
        ...state,
        {
          id: product.id,
          name: product.name, // localized {en,fr,ar} object kept as-is
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity: Math.min(quantity, max),
        },
      ]
    }
    case 'SET_QTY': {
      const { id, quantity } = action
      if (quantity <= 0) return state.filter((i) => i.id !== id)
      return state.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.min(quantity, i.stock ?? 99) }
          : i
      )
    }
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback(
    (product, quantity = 1) => dispatch({ type: 'ADD', product, quantity }),
    []
  )
  const setQuantity = useCallback(
    (id, quantity) => dispatch({ type: 'SET_QTY', id, quantity }),
    []
  )
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.quantity
        acc.subtotal += i.price * i.quantity
        return acc
      },
      { count: 0, subtotal: 0 }
    )
  }, [items])

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      total: subtotal, // shipping is calculated at delivery (COD)
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, count, subtotal, addItem, setQuantity, removeItem, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
