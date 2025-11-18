import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Menu({ token, onAdd }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/menu/today`)
        const data = await res.json()
        setItems(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-blue-200">Загрузка меню...</div>

  if (!items.length) return <div className="text-blue-200">Меню на сегодня пока не опубликовано.</div>

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map(i => (
        <div key={i.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold">{i.title}</h3>
              {i.description && <p className="text-blue-200 text-sm">{i.description}</p>}
            </div>
            <div className="text-white font-medium">{i.price.toFixed(2)} ₽</div>
          </div>
          <button onClick={() => onAdd(i)} className="mt-3 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">Добавить</button>
        </div>
      ))}
    </div>
  )
}
