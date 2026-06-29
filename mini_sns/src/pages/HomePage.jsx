import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, Dumbbell, ChevronRight, Bell, Plus, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import RingChart from '../components/RingChart'

const DEFAULT_WORKOUTS = ['벤치프레스 3×10', '스쿼트 3×12', '데드리프트 2×8', '풀업 3×실패']

export default function HomePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [water, setWater] = useState(0)
  const [checklist, setChecklist] = useState(DEFAULT_WORKOUTS.map(() => false))

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user) return
    supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('record_date', today)
      .single()
      .then(({ data }) => {
        if (data) { setRecord(data); setWater(data.water_intake || 0) }
      })
  }, [user])

  const upsertRecord = async (patch) => {
    const merged = {
      user_id: user.id,
      record_date: today,
      calories_consumed: record?.calories_consumed || 0,
      water_intake: water,
      exercise_duration: record?.exercise_duration || 0,
      ...patch,
    }
    const { data } = await supabase
      .from('daily_records')
      .upsert(merged, { onConflict: 'user_id,record_date' })
      .select()
      .single()
    if (data) setRecord(data)
  }

  const addWater = async (ml) => {
    const nw = Math.max(0, water + ml)
    setWater(nw)
    upsertRecord({ water_intake: nw })
  }

  const calorieGoal   = profile?.daily_calorie_goal   || 2000
  const exerciseGoal  = profile?.daily_exercise_goal  || 60
  const waterGoal     = 2000
  const calories      = record?.calories_consumed || 0
  const exerciseMin   = record?.exercise_duration || 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '좋은 아침이에요 ☀️' : hour < 18 ? '좋은 오후예요 💪' : '좋은 저녁이에요 🌙'
  const name = profile?.display_name || profile?.username || '운동러'
  const avatarUrl = profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00D4FF&color=fff&size=80`

  const checkedCount = checklist.filter(Boolean).length

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-5 bg-gradient-to-b from-cyan-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{greeting}</p>
            <h1 className="text-2xl font-black text-gray-900 mt-0.5">{name}님!</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <img src={avatarUrl} alt="avatar" className="w-11 h-11 rounded-full border-2 border-[#00D4FF] object-cover" />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4 bottom-safe">
        {/* 오늘 활동 카드 */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">오늘의 활동 링</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
            {(profile?.streak_count || 0) > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-full">
                <span>🔥</span>
                <span className="text-orange-400 font-bold text-sm">{profile.streak_count}일 연속</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            <RingChart
              calorieProgress={calories / calorieGoal}
              exerciseProgress={exerciseMin / exerciseGoal}
              waterProgress={water / waterGoal}
              size={128}
            />
            <div className="flex-1 space-y-3">
              {[
                { emoji: '🔥', label: '칼로리', val: calories,     goal: calorieGoal,  unit: 'kcal', color: '#00D4FF' },
                { emoji: '💪', label: '운동',   val: exerciseMin,  goal: exerciseGoal, unit: '분',   color: '#0891B2' },
                { emoji: '💧', label: '수분',   val: water,        goal: waterGoal,    unit: 'ml',   color: '#0E7490' },
              ].map(({ emoji, label, val, goal, unit, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{emoji} {label}</span>
                    <span className="text-white font-semibold">
                      {val}<span className="text-gray-500 font-normal">/{goal}{unit}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(Math.round(val / goal * 100), 100)}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 수분 섭취 */}
        <div className="bg-blue-50 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-gray-800 text-sm">수분 섭취 트래커</span>
            </div>
            <span className="text-sm text-blue-500 font-bold">{water}ml</span>
          </div>
          <div className="h-2 bg-blue-200 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(water / waterGoal * 100, 100)}%` }}
            />
          </div>
          <div className="flex gap-2">
            {[150, 250, 500].map(ml => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="flex-1 py-2.5 bg-white rounded-2xl text-xs font-bold text-blue-500 shadow-sm border border-blue-100 press"
              >
                +{ml}ml
              </button>
            ))}
            <button
              onClick={() => addWater(-250)}
              className="px-3 py-2.5 bg-white rounded-2xl text-xs font-bold text-gray-400 shadow-sm border border-gray-100 press"
            >
              취소
            </button>
          </div>
        </div>

        {/* 오늘의 운동 체크리스트 */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#00D4FF]" />
              <span className="font-bold text-gray-800 text-sm">오늘의 운동</span>
              <span className="text-xs text-[#00D4FF] font-bold bg-cyan-50 px-2 py-0.5 rounded-full">
                {checkedCount}/{checklist.length}
              </span>
            </div>
            <button onClick={() => navigate('/create')} className="flex items-center gap-0.5 text-xs text-[#00D4FF] font-semibold">
              추가 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {DEFAULT_WORKOUTS.map((w, i) => (
              <button
                key={i}
                onClick={() => setChecklist(prev => { const n = [...prev]; n[i] = !n[i]; return n })}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  checklist[i] ? 'bg-cyan-50 border border-cyan-100' : 'bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  checklist[i] ? 'bg-[#00D4FF] border-[#00D4FF]' : 'border-gray-300'
                }`}>
                  {checklist[i] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm font-medium flex-1 ${
                  checklist[i] ? 'line-through text-gray-400' : 'text-gray-700'
                }`}>{w}</span>
              </button>
            ))}
          </div>

          {checkedCount === checklist.length && (
            <div className="mt-3 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] rounded-2xl text-center">
              <span className="text-white text-sm font-black">🎉 오운완! 오늘도 멋져요!</span>
            </div>
          )}
        </div>

        {/* 퀵 액션 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/create')}
            className="bg-gradient-to-br from-[#00D4FF] to-[#0891B2] rounded-3xl p-4 text-white text-left shadow-md shadow-cyan-100 press"
          >
            <span className="text-2xl block mb-2">🏋️</span>
            <p className="font-black text-sm">운동 기록</p>
            <p className="text-xs opacity-80 mt-0.5">오운완 인증하기</p>
          </button>
          <button
            onClick={() => navigate('/create')}
            className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl p-4 text-white text-left shadow-md shadow-green-100 press"
          >
            <span className="text-2xl block mb-2">🥗</span>
            <p className="font-black text-sm">식단 기록</p>
            <p className="text-xs opacity-80 mt-0.5">오늘 뭐 먹었지?</p>
          </button>
        </div>

        {/* 피드 바로가기 */}
        <button
          onClick={() => navigate('/feed')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100 press"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00D4FF] to-[#0891B2] rounded-2xl flex items-center justify-center">
              <span className="text-lg">📸</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800 text-sm">오운완 피드</p>
              <p className="text-xs text-gray-500">다른 사람들의 운동을 보며 동기부여</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
