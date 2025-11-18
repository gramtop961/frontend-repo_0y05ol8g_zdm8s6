import { useEffect, useState } from 'react'
import AuthPanel from './components/AuthPanel'
import Menu from './components/Menu'
import Cart from './components/Cart'
import AdminPanel from './components/AdminPanel'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const t = localStorage.getItem('auth_token')
    const u = localStorage.getItem('auth_user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  useEffect(() => {
    if (!token) return
    const loadOrders = async () => {
      try {
        const res = await fetch(`${API}/orders/me`, { headers: { Authorization: `Bearer ${token}` }})
        const data = await res.json()
        if (res.ok) setOrders(data)
      } catch (e) { console.error(e) }
    }
    loadOrders()
  }, [token])

  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) return prev.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const changeQty = (id, qty) => {
    setCart((prev) => prev.map((p) => p.id === id ? { ...p, quantity: qty } : p))
  }

  const placeOrder = async () => {
    try {
      const payload = { items: cart.map(c => ({ item_id: c.id, title: c.title, price: c.price, quantity: c.quantity })) }
      const res = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Ошибка оформления заказа')
      setCart([])
      const list = await fetch(`${API}/orders/me`, { headers: { Authorization: `Bearer ${token}` }})
      const ordersData = await list.json()
      setOrders(ordersData)
      alert('Заказ оформлен!')
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="relative max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Дневное меню</h1>
        </header>

        <AuthPanel user={user} setUser={setUser} token={token} setToken={setToken} />

        {user?.role === 'admin' && (
          <AdminPanel token={token} user={user} onPublished={() => {
            // refresh menu by emitting a custom event listened by Menu or simply reload page state
            // simplest: do nothing here; user can switch category to refresh; keep minimal logic
          }} />
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-white font-semibold">Меню на сегодня</h2>
            <Menu token={token} onAdd={addToCart} />
          </div>
          <div className="space-y-3">
            <Cart cart={cart} onQty={changeQty} onOrder={placeOrder} token={token} />
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Мои заказы</h3>
              {!orders.length && <div className="text-blue-200">Пока нет заказов</div>}
              <div className="space-y-2 max-h-60 overflow-auto pr-2">
                {orders.map(o => (
                  <div key={o.id} className="p-2 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">{new Date(o.created_at).toLocaleString()}</span>
                      <span className="text-white font-medium">{o.total.toFixed(2)} ₽</span>
                    </div>
                    <div className="text-blue-200 text-sm">{o.items.map(i=>`${i.title}×${i.quantity}`).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-blue-300/60 text-sm py-6">Сервис заказов обедов</footer>
      </div>
    </div>
  )
}

export default App
