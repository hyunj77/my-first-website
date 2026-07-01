import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import { TrendingUp, Flame, Droplets, Dumbbell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const DEMO_WEEKLY = [
  { day: '월', calories: 1850, exercise: 45, water: 1500 },
  { day: '화', calories: 2100, exercise: 60, water: 1800 },
  { day: '수', calories: 1950, exercise: 30, water: 1200 },
  { day: '목', calories: 2200, exercise: 75, water: 2000 },
  { day: '금', calories: 1800, exercise: 50, water: 1600 },
  { day: '토', calories: 2400, exercise: 90, water: 2200 },
  { day: '일', calories: 2050, exercise: 40, water: 1900 },
]

export default function ReportPage() {
  const { profile } = useAuth()
  const [period, setPeriod] = useState('week')

  const records = DEMO_WEEKLY

  const calorieGoal = profile?.daily_calorie_goal || 2000
  const exerciseGoal = profile?.daily_exercise_goal || 60

  const avgCalories = Math.round(records.reduce((s, r) => s + r.calories, 0) / records.length)
  const avgExercise = Math.round(records.reduce((s, r) => s + r.exercise, 0) / records.length)
  const avgWater = Math.round(records.reduce((s, r) => s + r.water, 0) / records.length)
  const exerciseDays = records.filter(r => r.exercise > 0).length

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs">
        <p className="font-bold mb-1">{label}요일</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{p.name === '칼로리' ? 'kcal' : p.name === '운동' ? '분' : 'ml'}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-gray-900">주간 리포트</h1>
          <TrendingUp className="w-6 h-6 text-[#00D4FF]" />
        </div>

        <div className="flex gap-2">
          {[['week', '주간'], ['month', '월간']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all press ${
                period === key
                  ? 'bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white shadow-md shadow-cyan-200'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 bottom-safe space-y-4">
        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Flame,    label: '평균 칼로리', value: `${avgCalories.toLocaleString()}`, unit: 'kcal',  color: '#00D4FF', bg: 'from-[#00D4FF]/10 to-cyan-50',  pct: Math.round(avgCalories / calorieGoal * 100) },
            { icon: Dumbbell, label: '평균 운동',   value: `${avgExercise}`,                  unit: '분/일', color: '#0891B2', bg: 'from-blue-100 to-blue-50',        pct: Math.round(avgExercise / exerciseGoal * 100) },
            { icon: Droplets, label: '평균 수분',   value: `${avgWater}`,                     unit: 'ml/일', color: '#0E7490', bg: 'from-teal-100 to-teal-50',        pct: Math.round(avgWater / 2000 * 100) },
            { icon: Flame,    label: '운동한 날',   value: `${exerciseDays}`,                 unit: '일',    color: '#f97316', bg: 'from-orange-100 to-orange-50',    pct: Math.round(exerciseDays / records.length * 100) },
          ].map(({ icon: Icon, label, value, unit, color, bg, pct }) => (
            <div key={label} className={`bg-gradient-to-br ${bg} rounded-2xl p-3.5`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="font-black text-gray-900 text-lg leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{unit}</p>
              <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
              </div>
              <p className="text-[10px] font-bold mt-1" style={{ color }}>{pct}%</p>
            </div>
          ))}
        </div>

        {/* 칼로리 차트 */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-sm mb-3">🔥 칼로리 섭취 추이</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={records} barCategoryGap="30%">
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 'dataMax + 300']} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calories" name="칼로리" fill="#00D4FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>목표: {calorieGoal.toLocaleString()}kcal/일</span>
            <span className={avgCalories >= calorieGoal * 0.9 ? 'text-green-500 font-bold' : 'text-gray-400'}>
              {avgCalories >= calorieGoal * 0.9 ? '✓ 목표 달성!' : `${calorieGoal - avgCalories}kcal 부족`}
            </span>
          </div>
        </div>

        {/* 운동 시간 차트 */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-sm mb-3">💪 운동 시간 (분)</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={records}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="exercise"
                name="운동"
                stroke="#0891B2"
                strokeWidth={2.5}
                dot={{ fill: '#0891B2', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 수분 섭취 */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
          <p className="font-bold text-gray-800 text-sm mb-3">💧 수분 섭취량 (ml)</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={records} barCategoryGap="30%">
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="water" name="수분" fill="#0E7490" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 주간 성취 메시지 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 text-white text-center">
          <p className="text-3xl mb-2">
            {exerciseDays >= 5 ? '🏆' : exerciseDays >= 3 ? '⭐' : '💪'}
          </p>
          <p className="font-black text-lg">
            {exerciseDays >= 5 ? '이번 주 최고예요!' : exerciseDays >= 3 ? '잘 하고 있어요!' : '조금만 더 힘내요!'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {period === 'week' ? '7일' : '30일'} 중 {exerciseDays}일 운동 · 평균 {avgExercise}분
          </p>
        </div>

        <div className="pb-4" />
      </div>

      <BottomNav />
    </div>
  )
}
