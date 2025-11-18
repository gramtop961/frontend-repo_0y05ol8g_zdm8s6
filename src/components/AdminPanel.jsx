import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function AdminPanel({ token, user, onPublished }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState(true)
  const [category, setCategory] = useState('')
  const [day, setDay] = useState(() => new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canUse = user && user.role === 'admin'

  const categories = useMemo(() => [
    'soup', 'salad', 'main', 'side', 'drink', 'dessert', 'other'
  ], [])

  const submit = async (e) => {
    e.preventDefault()
    if (!canUse) return

    // Normalize price (support comma and dot)
    const priceNum = parseFloat(String(price).replace(',', '.'))
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Введите корректную цену (например, 250.00)')
      return
    }

    setLoading(true)
    setError('')
    try {
      const body = { title, description, price: priceNum, available, day, category: category || null }
      const res = await fetch(`${API}/menu`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || (data?.errors?.[0]?.msg) || 'Ошибка публикации')
      setTitle('')
      setDescription('')
      setPrice('')
      setAvailable(true)
      setCategory('')
      if (onPublished) onPublished()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!canUse) return null

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Панель администратора</h3>
      <form className="grid md:grid-cols-2 gap-3" onSubmit={submit}>
        <div className="md:col-span-2">
          <label className="text-sm text-blue-200">Дата меню</label>
          <input type="date" value={day} onChange={e=>setDay(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" required />
        </div>
        <div>
          <label className="text-sm text-blue-200">Название блюда</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" required />
        </div>
        <div>
          <label className="text-sm text-blue-200">Категория</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white">
            <option value="">—</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-blue-200">Описание</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" rows={2} />
        </div>
        <div>
          <label className="text-sm text-blue-200">Цена</label>
          <input type="text" inputMode="decimal" placeholder="например, 250.00" value={price} onChange={e=>setPrice(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" required />
        </div>
        <div className="flex items-center gap-2">
          <input id="avail" type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)} />
          <label htmlFor="avail" className="text-blue-200">Доступно</label>
        </div>
        {error && <div className="md:col-span-2 text-red-400 text-sm">{error}</div>}
        <div className="md:col-span-2 flex justify-end">
          <button disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg transition">{loading ? 'Публикуем...' : 'Добавить в меню'}</button>
        </div>
      </form>
    </div>
  )
}
