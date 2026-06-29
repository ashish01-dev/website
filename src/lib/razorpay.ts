const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
}

export async function createOrder(amount: number, currency = 'INR'): Promise<RazorpayOrder | null> {
  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function openCheckout(order: RazorpayOrder, onSuccess: () => void, onFailure?: () => void) {
  const loaded = await loadRazorpayScript()
  if (!loaded) return

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'JEEIFY',
    description: 'JEE 2027 Pro Plan',
    order_id: order.id,
    handler: () => onSuccess(),
    modal: { ondismiss: () => onFailure?.() },
    prefill: { contact: '', email: '' },
    theme: { color: '#2383e2' },
  }

  const rzp = new (window as any).Razorpay(options)
  rzp.open()
}
