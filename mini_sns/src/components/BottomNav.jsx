import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Grid2X2, Plus, BarChart2, User } from 'lucide-react'

const LEFT = [
  { icon: Home,      label: '홈',    path: '/' },
  { icon: Grid2X2,   label: '피드',  path: '/feed' },
]
const RIGHT = [
  { icon: BarChart2, label: '리포트', path: '/report' },
  { icon: User,      label: '마이',   path: '/mypage' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const NavBtn = ({ icon: Icon, label, path }) => {
    const active = pathname === path
    return (
      <button
        onClick={() => navigate(path)}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px]"
      >
        <Icon
          className={`w-6 h-6 transition-all duration-200 ${active ? 'text-[#00D4FF]' : 'text-gray-400'}`}
          strokeWidth={active ? 2.5 : 1.8}
        />
        <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-[#00D4FF]' : 'text-gray-400'}`}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white/95 backdrop-blur-md border-t border-gray-100">
      <div className="flex items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {LEFT.map(item => <NavBtn key={item.path} {...item} />)}

        {/* 가운데 FAB */}
        <button
          onClick={() => navigate('/create')}
          className="flex flex-col items-center justify-center mx-3 press"
        >
          <div className="w-14 h-14 -mt-5 bg-gradient-to-br from-[#00D4FF] to-[#0891B2] rounded-2xl shadow-lg shadow-cyan-300/50 flex items-center justify-center">
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold text-[#00D4FF] mt-0.5">기록</span>
        </button>

        {RIGHT.map(item => <NavBtn key={item.path} {...item} />)}
      </div>
    </nav>
  )
}
