import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import PostCard from '../components/PostCard'

const TABS = [
  { key: 'workout', label: '🏋️ 오운완' },
  { key: 'diet',    label: '🥗 식단팁' },
]

const DEMO_POSTS = [
  { id: 'd1', user_id: 'demo', caption: '오늘도 오운완 💪', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', likes_count: 24, category: 'workout', created_at: new Date().toISOString(), profiles: { username: 'fituser01', display_name: '헬스왕', avatar_url: '' } },
  { id: 'd2', user_id: 'demo', caption: '단백질 샐러드 🥗', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', likes_count: 18, category: 'diet', created_at: new Date().toISOString(), profiles: { username: 'dietlover', display_name: '다이어터', avatar_url: '' } },
  { id: 'd3', user_id: 'demo', caption: '스쿼트 PR 달성! 🔥', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', likes_count: 41, category: 'workout', created_at: new Date().toISOString(), profiles: { username: 'squat_king', display_name: '스쿼트킹', avatar_url: '' } },
  { id: 'd4', user_id: 'demo', caption: '저탄고지 식단 Day 7', image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', likes_count: 32, category: 'diet', created_at: new Date().toISOString(), profiles: { username: 'keto_life', display_name: '키토라이프', avatar_url: '' } },
  { id: 'd5', user_id: 'demo', caption: '새벽 5시 런닝 ⭐', image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80', likes_count: 56, category: 'workout', created_at: new Date().toISOString(), profiles: { username: 'morning_run', display_name: '새벽런너', avatar_url: '' } },
  { id: 'd6', user_id: 'demo', caption: '닭가슴살 도시락 💯', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', likes_count: 29, category: 'diet', created_at: new Date().toISOString(), profiles: { username: 'meal_prep', display_name: '도시락왕', avatar_url: '' } },
]

export default function FeedPage() {
  const [tab, setTab] = useState('workout')
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setPosts(DEMO_POSTS.filter(p => p.category === tab))
  }, [tab])

  const filtered = posts.filter(p =>
    !search || p.caption?.toLowerCase().includes(search.toLowerCase()) ||
    p.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black text-gray-900">커뮤니티 피드</h1>
          <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <SlidersHorizontal className="w-4.5 h-4.5 text-gray-500" />
          </button>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="게시물, 사용자 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
          />
        </div>

        {/* 탭 */}
        <div className="flex gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-2xl text-sm font-bold transition-all ${
                tab === key
                  ? 'bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white shadow-md shadow-cyan-200'
                  : 'bg-gray-50 text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 피드 그리드 */}
      <div className="px-4 pt-3 bottom-safe">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">{tab === 'workout' ? '🏋️' : '🥗'}</span>
            <p className="text-gray-500 font-medium text-sm">첫 번째 게시물을 올려보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
