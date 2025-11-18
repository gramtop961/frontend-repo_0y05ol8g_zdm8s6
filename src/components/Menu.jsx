import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Menu({ token, onAdd }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  const categories = useMemo(() => [
    { key: '', label: 'Все' },
    { key: 'soup', label: 'Супы' },
    { key: 'salad', label: 'Салаты' },
    { key: 'main', label: 'Горячее' },
    { key: 'side', label: 'Гарниры' },
    { key: 'drink', label: 'Напитки' },
    { key: 'dessert', label: 'Десерты' },
    { key: 'other', label: 'Другое' },
  ], [])

  const load = async (selected) => {
    setLoading(true)
    try {
      const q = selected ? `?category=${encodeURIComponent(selected)}` : ''
      const res = await fetch(`${API}/menu/today${q}`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  const onFilter = (c) => {
    setCategory(c)
    load(c)
  }

  if (loading) return <div className="text-blue-200">Загрузка меню...</div>

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(c => (
          <button key={c.key} onClick={() => onFilter(c.key)} className={`px-3 py-1 rounded-full text-sm border ${category===c.key ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/60 border-slate-700 text-blue-200'}`}>{c.label}</button>
        ))}
      </div>

      {!items.length && !loading && <div className="text-blue-200">Меню на сегодня пока не опубликовано.</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(i => (
          <div key={i.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold">{i.title}</h3>
                {i.category && <p className="text-xs text-blue-300/70">#{i.category}</p>}
                {i.description && <p className="text-blue-200 text-sm">{i.description}</p>}
              </div>
              <div className="text-white font-medium">{i.price.toFixed(2)} ₽</div>
            </div>
            <button onClick={() => onAdd(i)} className="mt-3 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">Добавить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
