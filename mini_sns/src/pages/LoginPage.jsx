import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Zap, AlertTriangle, CheckCircle, Mail } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

// ─── 에러 메시지 한국어 변환 ──────────────────────────────────────────────────
function parseError(err) {
  const msg = err?.message || String(err)
  if (msg === 'Failed to fetch' || msg.includes('fetch'))
    return {
      text: 'Supabase 서버에 연결할 수 없습니다.',
      hint: 'Supabase 대시보드에서 ① 프로젝트가 활성화(비일시중단) 상태인지, ② Authentication → URL Configuration의 Site URL이 올바른지 확인하세요.',
    }
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials'))
    return { text: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  if (msg.includes('Email not confirmed'))
    return { text: '이메일 인증이 필요합니다. 받은편지함을 확인하세요.' }
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return { text: '이미 가입된 이메일입니다. 로그인 탭을 이용해 주세요.' }
  if (msg.includes('Password should be'))
    return { text: '비밀번호는 최소 6자 이상이어야 합니다.' }
  if (msg.includes('rate limit') || msg.includes('too many'))
    return { text: '잠시 후 다시 시도해 주세요. (요청 횟수 초과)' }
  return { text: msg }
}

// ─── Supabase 미설정 배너 ─────────────────────────────────────────────────────
function ConfigBanner() {
  if (isConfigured) return null
  return (
    <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <p className="font-bold mb-1">Supabase가 연결되지 않았습니다</p>
          <p>GitHub 저장소 → Settings → Secrets and variables → Actions에서</p>
          <p className="font-mono mt-1">VITE_SUPABASE_URL</p>
          <p className="font-mono">VITE_SUPABASE_ANON_KEY</p>
          <p className="mt-1">두 값을 등록한 뒤 Actions를 다시 실행하세요.</p>
        </div>
      </div>
    </div>
  )
}

// ─── 이메일 인증 대기 화면 ────────────────────────────────────────────────────
function EmailVerifyScreen({ email, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00D4FF]/10 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
        <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#00D4FF]" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">이메일을 확인해 주세요!</h2>
        <p className="text-sm text-gray-500 mb-1">
          <span className="font-semibold text-gray-700">{email}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          으로 인증 링크를 보냈습니다.<br />
          받은 편지함에서 링크를 클릭하면 바로 로그인됩니다.
        </p>
        <div className="bg-amber-50 rounded-2xl p-3 text-xs text-amber-700 mb-6 text-left">
          <p className="font-bold mb-1">📌 이메일이 안 온다면?</p>
          <p>• 스팸 폴더를 확인하세요</p>
          <p>• Supabase 대시보드 → Authentication → Providers → Email에서 <strong>Confirm email</strong> 옵션을 <strong>OFF</strong>로 설정하면 인증 없이 바로 가입됩니다</p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl press"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  )
}

// ─── 신체 정보 팝업 ───────────────────────────────────────────────────────────
function BodyInfoPopup({ userId, onDone }) {
  const [form, setForm] = useState({ height: '', weight: '', activity: 'moderate' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const calorieMap = { low: 1800, moderate: 2100, high: 2500 }
    const exerciseMap = { low: 30, moderate: 60, high: 90 }
    await supabase.from('profiles').update({
      height: form.height ? parseFloat(form.height) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      activity_level: form.activity,
      daily_calorie_goal: calorieMap[form.activity],
      daily_exercise_goal: exerciseMap[form.activity],
    }).eq('id', userId)
    setSaving(false)
    onDone()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#00D4FF]/10 to-blue-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚡</div>
          <h2 className="text-xl font-black text-gray-900">3초 신체 정보</h2>
          <p className="text-sm text-gray-500 mt-1">맞춤 목표를 자동으로 세팅해 드려요</p>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input type="number" placeholder="키 (cm)" value={form.height}
              onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
              className="flex-1 px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]" />
            <input type="number" placeholder="몸무게 (kg)" value={form.weight}
              onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
              className="flex-1 px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]" />
          </div>
          <select value={form.activity} onChange={e => setForm(p => ({ ...p, activity: e.target.value }))}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]">
            <option value="low">🚶 활동량 낮음 (주 1-2회)</option>
            <option value="moderate">🏃 활동량 보통 (주 3-4회)</option>
            <option value="high">🔥 활동량 높음 (주 5회+)</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full mt-5 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white font-black rounded-2xl shadow-lg shadow-cyan-200 press disabled:opacity-60">
          {saving ? '저장 중...' : '🚀 시작하기'}
        </button>
        <button onClick={onDone} className="w-full mt-2 py-3 text-gray-400 text-sm">나중에 설정하기</button>
      </div>
    </div>
  )
}

// ─── 메인 로그인 페이지 ───────────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)        // { text, hint? }
  const [screen, setScreen] = useState('form')    // 'form' | 'verify' | 'bodyinfo'
  const [newUserId, setNewUserId] = useState(null)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error: err } = await signIn({ email, password })
    if (err) { setError(parseError(err)); setLoading(false) }
    // 성공 시 AuthContext → App.jsx에서 자동 리다이렉트
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setError({ text: '사용자명은 영문·숫자·_ 3~20자만 가능합니다.' }); return
    }
    setLoading(true); setError(null)
    const { data, error: err } = await signUp({ email, password, username, displayName: displayName || username })
    if (err) {
      setError(parseError(err)); setLoading(false)
    } else {
      setLoading(false)
      // session이 있으면 이메일 확인 없이 바로 가입된 것
      if (data?.session) {
        setNewUserId(data.user.id)
        setScreen('bodyinfo')
      } else {
        // 이메일 인증 대기
        setScreen('verify')
      }
    }
  }

  if (screen === 'verify') return <EmailVerifyScreen email={email} onBack={() => setScreen('form')} />
  if (screen === 'bodyinfo') return <BodyInfoPopup userId={newUserId} onDone={() => navigate('/')} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00D4FF]/10 via-white to-blue-50">
      {/* 브랜드 헤더 */}
      <div className="pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Zap className="w-9 h-9 text-[#00D4FF]" fill="#00D4FF" />
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Fitsta</h1>
        </div>
        <p className="text-gray-500 text-sm font-medium">헬스&amp;식단 커뮤니티</p>

        {/* 연결 상태 뱃지 */}
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
          isConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {isConfigured
            ? <><CheckCircle className="w-3.5 h-3.5" /> Supabase 연결됨</>
            : <><AlertTriangle className="w-3.5 h-3.5" /> Supabase 미연결</>}
        </div>
      </div>

      <ConfigBanner />

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

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-xs font-semibold">{error.text}</p>
              {error.hint && (
                <p className="text-red-400 text-xs mt-1 leading-relaxed">{error.hint}</p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || !isConfigured}
            className="w-full py-4 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white font-black rounded-2xl shadow-lg shadow-cyan-200 press disabled:opacity-60 transition-all">
            {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
          </button>

          {!isConfigured && (
            <p className="text-center text-xs text-gray-400">
              Supabase를 연결해야 로그인/회원가입이 가능합니다
            </p>
          )}
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
