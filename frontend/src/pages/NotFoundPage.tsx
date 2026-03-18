import { useNavigate } from 'react-router'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: '#060B26' }}
    >
      <h1
        className="text-[120px] font-bold leading-none sm:text-[180px]"
        style={{
          background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        404
      </h1>
      <p className="mt-4 text-xl font-bold text-white">
        Страница не найдена
      </p>
      <p className="mt-2 text-sm text-white/50">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-8 rounded-xl bg-[#0075FF] px-8 py-3 text-sm font-bold text-white uppercase tracking-wider transition-all hover:bg-[#0063D6] hover:shadow-[0_0_20px_rgba(0,117,255,0.4)]"
      >
        Перейти на Дашборд
      </button>
    </div>
  )
}
