import { useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function AuthPanel({ user, setUser, token, setToken }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Ошибка входа')
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      } else {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Ошибка регистрации')
        // auto-login after register
        const loginRes = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const loginData = await loginRes.json()
        if (!loginRes.ok) throw new Error(loginData.detail || 'Ошибка входа')
        setUser(loginData.user)
        setToken(loginData.token)
        localStorage.setItem('auth_token', loginData.token)
        localStorage.setItem('auth_user', JSON.stringify(loginData.user))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    } catch {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
    setToken('')
  }

  if (user) {
    return (
      <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <div>
          <p className="text-white font-medium">Привет, {user.name}</p>
          <p className="text-blue-200 text-sm">{user.email}</p>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">Выйти</button>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setIsLogin(true)} className={`px-3 py-1 rounded ${isLogin ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-200'}`}>Вход</button>
        <button onClick={() => setIsLogin(false)} className={`px-3 py-1 rounded ${!isLogin ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-200'}`}>Регистрация</button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Имя" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" required />
        )}
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Пароль" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" required />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button disabled={loading} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition">{loading ? 'Подождите...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}</button>
      </form>
    </div>
  )
}
