import { computed, ref } from 'vue'
import type { Product } from '../types'

export interface CartLine {
  product: Product
  quantity: number
}

const lines = ref<CartLine[]>([])

export function useCart() {
  const totalCount = computed(() =>
    lines.value.reduce((n, l) => n + l.quantity, 0),
  )

  const subtotal = computed(() =>
    lines.value.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
  )

  function addToCart(product: Product, qty = 1) {
    if (!product.inStock) return
    const i = lines.value.findIndex((l) => l.product.id === product.id)
    if (i >= 0) {
      const next = [...lines.value]
      next[i] = { ...next[i], quantity: next[i].quantity + qty }
      lines.value = next
    } else {
      lines.value = [...lines.value, { product, quantity: qty }]
    }
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      lines.value = lines.value.filter((l) => l.product.id !== productId)
      return
    }
    const i = lines.value.findIndex((l) => l.product.id === productId)
    if (i < 0) return
    const next = [...lines.value]
    next[i] = { ...next[i], quantity }
    lines.value = next
  }

  function removeLine(productId: string) {
    lines.value = lines.value.filter((l) => l.product.id !== productId)
  }

  function clearCart() {
    lines.value = []
  }

  return {
    lines,
    totalCount,
    subtotal,
    addToCart,
    setQuantity,
    removeLine,
    clearCart,
  }
}
