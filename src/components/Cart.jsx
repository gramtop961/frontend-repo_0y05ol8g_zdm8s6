export default function Cart({ cart, onQty, onOrder, token }) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Ваш заказ</h3>
      {!cart.length && <div className="text-blue-200">Корзина пуста</div>}
      {cart.map((i) => (
        <div key={i.id} className="flex items-center justify-between py-2 border-b border-slate-700/60 last:border-0">
          <div>
            <p className="text-white">{i.title}</p>
            <p className="text-blue-200 text-sm">{i.price.toFixed(2)} ₽</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onQty(i.id, Math.max(1, i.quantity - 1))} className="px-2 py-1 bg-slate-700 text-white rounded">-</button>
            <span className="text-white">{i.quantity}</span>
            <button onClick={() => onQty(i.id, i.quantity + 1)} className="px-2 py-1 bg-slate-700 text-white rounded">+</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between mt-3">
        <div className="text-white font-semibold">Итого: {total.toFixed(2)} ₽</div>
        <button disabled={!cart.length || !token} onClick={() => onOrder()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition">Оформить</button>
      </div>
      {!token && <div className="text-yellow-300 text-sm mt-2">Авторизуйтесь, чтобы оформить заказ</div>}
    </div>
  )
}
