import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await signIn({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setError('사용자명은 영문·숫자·_ 3~20자만 가능합니다.')
      return
    }
    setLoading(true)
    setError(null)
    const { error: err } = await signUp({ email, password, username, displayName: displayName || username })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00D4FF]/10 via-white to-blue-50">
      {/* 브랜드 헤더 */}
      <div className="pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Zap className="w-9 h-9 text-[#00D4FF]" fill="#00D4FF" />
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Fitsta</h1>
        </div>
        <p className="text-gray-500 text-sm font-medium">헬스&amp;식단 커뮤니티</p>
      </div>

      {/* 카드 */}
      <div className="mx-4 bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* 탭 */}
        <div className="flex">
          {[['login', '로그인'], ['signup', '회원가입']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(null) }}
              className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${
                tab === key ? 'text-[#00D4FF] border-[#00D4FF]' : 'text-gray-400 border-transparent'}`}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="p-5 space-y-3">
          {tab === 'signup' && (
            <>
              <input type="text" placeholder="사용자명 (영문·숫자·_ 3~20자)"
                value={username} onChange={e => setUsername(e.target.value.toLowerCase())} required
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]" />
              <input type="text" placeholder="닉네임 (표시 이름)"
                value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]" />
            </>
          )}

          <input type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="email"
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]" />

          <div className="relative">
            <input type={showPw ? 'text' : 'password'} placeholder="비밀번호 (최소 6자)"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF] pr-12" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-xs font-semibold">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white font-black rounded-2xl shadow-lg shadow-cyan-200 press disabled:opacity-60 transition-all">
            {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* 소셜 로그인 */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">또는 소셜 로그인</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: '카카오', bg: '#FEE500', text: '#3C1E1E', emoji: '💬' },
              { name: '구글',   bg: '#fff',    text: '#333',    emoji: '🔍', border: true },
              { name: '애플',   bg: '#000',    text: '#fff',    emoji: '🍎' },
            ].map(s => (
              <button key={s.name} type="button"
                onClick={() => alert(`${s.name} 로그인은 준비 중입니다.`)}
                className="py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 press"
                style={{ background: s.bg, color: s.text, border: s.border ? '1.5px solid #e5e7eb' : 'none' }}>
                <span className="text-base">{s.emoji}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 pb-10">
        Fitsta : 헬스&amp;식단 커뮤니티 © 2026
      </p>
    </div>
  )
}
