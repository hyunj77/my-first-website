import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Grid2X2, ChevronRight, Flame, Edit3, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import PostCard from '../components/PostCard'

function StreakCalendar({ streak }) {
  const today = new Date()
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (34 - i))
    return {
      date: d.getDate(),
      month: d.getMonth(),
      active: i >= 35 - streak,
      isToday: i === 34,
    }
  })
  const weekLabels = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekLabels.map(w => (
          <div key={w} className="text-center text-[10px] text-gray-400 font-semibold">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
              d.isToday ? 'ring-2 ring-[#00D4FF] ring-offset-1' : ''
            } ${
              d.active ? 'bg-gradient-to-br from-[#00D4FF] to-[#0891B2] text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {d.active ? '🔥' : d.date}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyPage() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [myPosts, setMyPosts] = useState([])
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 })
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' })

  useEffect(() => {
    if (!user) return
    fetchMyPosts()
    fetchStats()
    setEditForm({ display_name: profile?.display_name || '', bio: profile?.bio || '' })
  }, [user, profile])

  const fetchMyPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMyPosts(data || [])
    } catch {}
  }

  const fetchStats = async () => {
    try {
      const [{ count: followers }, { count: following }, { count: posts }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setStats({ followers: followers || 0, following: following || 0, posts: posts || 0 })
    } catch {}
  }

  const handleSaveProfile = async () => {
    await updateProfile({
      display_name: editForm.display_name,
      bio: editForm.bio,
    })
    setEditing(false)
  }

  const handleSignOut = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut()
      navigate('/login')
    }
  }

  const name = profile?.display_name || profile?.username || '사용자'
  const avatar = profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00D4FF&color=fff&size=120`
  const streak = profile?.streak_count || 0

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">마이페이지</h1>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 press">
            <Edit3 className="w-4.5 h-4.5 text-gray-600" />
          </button>
          <button onClick={handleSignOut} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 press">
            <LogOut className="w-4.5 h-4.5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-5 bottom-safe space-y-4">
        {/* 프로필 */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full border-3 border-[#00D4FF] object-cover" style={{ borderWidth: 3 }} />
            {streak > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
                🔥{streak}
              </div>
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={e => setEditForm(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="닉네임"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                />
                <input
                  type="text"
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="자기소개"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                />
                <button onClick={handleSaveProfile} className="px-4 py-1.5 bg-[#00D4FF] text-white text-xs font-bold rounded-full press">
                  저장
                </button>
              </div>
            ) : (
              <>
                <p className="font-black text-gray-900 text-lg leading-tight">{name}</p>
                <p className="text-gray-500 text-sm">@{profile?.username}</p>
                {profile?.bio && <p className="text-gray-600 text-xs mt-1">{profile.bio}</p>}
              </>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '게시물', value: stats.posts },
            { label: '팔로워', value: stats.followers },
            { label: '팔로잉', value: stats.following },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-2xl py-3 text-center">
              <p className="font-black text-xl text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 신체 정보 */}
        {(profile?.height || profile?.weight) && (
          <div className="bg-gradient-to-br from-[#00D4FF]/10 to-blue-50 rounded-3xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">신체 정보</p>
            <div className="flex gap-3">
              {[
                { label: '키', value: profile.height ? `${profile.height}cm` : '-' },
                { label: '체중', value: profile.weight ? `${profile.weight}kg` : '-' },
                { label: '활동량', value: { low: '낮음', moderate: '보통', high: '높음' }[profile.activity_level] || '-' },
                { label: '목표칼로리', value: profile.daily_calorie_goal ? `${profile.daily_calorie_goal}kcal` : '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 text-center">
                  <p className="font-black text-gray-900 text-sm">{value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 스트릭 캘린더 */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" fill="#f97316" />
              <span className="font-bold text-gray-800 text-sm">연속 기록 스트릭</span>
            </div>
            <span className="text-sm font-black text-orange-500">{streak}일 연속 🔥</span>
          </div>
          <StreakCalendar streak={streak} />
          <p className="text-xs text-gray-400 text-center mt-3">
            매일 기록하면 스트릭이 쌓여요! 오늘도 화이팅 💪
          </p>
        </div>

        {/* 내 게시물 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Grid2X2 className="w-5 h-5 text-[#00D4FF]" />
            <span className="font-bold text-gray-800 text-sm">내 게시물</span>
          </div>
          {myPosts.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 bg-gray-50 rounded-3xl">
              <span className="text-4xl">📸</span>
              <p className="text-gray-500 text-sm font-medium">아직 게시물이 없어요</p>
              <button
                onClick={() => navigate('/create')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white text-sm font-bold rounded-full press"
              >
                첫 오운완 올리기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {myPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>

        {/* 설정 메뉴 */}
        <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
          {[
            { icon: '⚙️', label: '앱 설정', action: () => {} },
            { icon: '🔔', label: '알림 설정', action: () => {} },
            { icon: '🔒', label: '개인정보 처리방침', action: () => {} },
            { icon: '📞', label: '고객 지원', action: () => {} },
          ].map(({ icon, label, action }, i) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center justify-between px-4 py-3.5 press ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="pb-4" />
      </div>

      <BottomNav />
    </div>
  )
}
