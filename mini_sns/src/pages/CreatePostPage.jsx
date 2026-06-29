import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image, Sparkles, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STEP_LABELS = ['내용 입력', '사진 선택', '스티커 합성', '게시']

const SAMPLE_IMAGES = {
  workout: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
  ],
  diet: [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    'https://images.unsplash.com/photo-1559181567-c3190e01f57d?w=600&q=80',
  ],
}

export default function CreatePostPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('workout')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [stickerApplied, setStickerApplied] = useState(false)
  const [routines, setRoutines] = useState([{ name: '', sets: '', reps: '', weight: '' }])
  const [posting, setPosting] = useState(false)

  const calorieGoal = profile?.daily_calorie_goal || 2000
  const exerciseGoal = profile?.daily_exercise_goal || 60

  const addRoutine = () => setRoutines(prev => [...prev, { name: '', sets: '', reps: '', weight: '' }])
  const removeRoutine = (i) => setRoutines(prev => prev.filter((_, idx) => idx !== i))
  const updateRoutine = (i, field, val) => setRoutines(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const handlePost = async () => {
    setPosting(true)
    const validRoutines = routines.filter(r => r.name.trim())
    const finalImage = imageUrl || SAMPLE_IMAGES[category][0]

    try {
      await supabase.from('posts').insert({
        user_id: user.id,
        caption: caption.trim(),
        image_url: finalImage,
        category,
        routine_data: validRoutines,
        likes_count: 0,
      })
      navigate('/feed')
    } catch (e) {
      alert('게시물 등록 중 오류가 발생했습니다. Supabase 연결을 확인해주세요.')
    } finally {
      setPosting(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const previewImage = imageUrl || SAMPLE_IMAGES[category][0]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-gray-100">
        <button onClick={() => step === 0 ? navigate(-1) : prevStep()} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center press">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-gray-900 text-base">게시물 작성</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {step + 1}단계: {STEP_LABELS[step]}
          </p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex px-4 pt-3 gap-1.5">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#00D4FF]' : 'bg-gray-100'}`}
          />
        ))}
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* STEP 0: 카테고리 + 캡션 + 루틴 */}
        {step === 0 && (
          <>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">카테고리</label>
              <div className="flex gap-2">
                {[['workout', '🏋️ 오운완'], ['diet', '🥗 식단팁']].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all press ${
                      category === key
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white shadow-md shadow-cyan-200'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">내용 (캡션)</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder={category === 'workout'
                  ? '오늘 운동 어떠셨나요? #오운완 #Fitsta'
                  : '오늘의 식단을 공유해보세요! #식단 #다이어트'}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{caption.length}/500</p>
            </div>

            {category === 'workout' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">운동 루틴 태그</label>
                  <button onClick={addRoutine} className="flex items-center gap-1 text-xs text-[#00D4FF] font-bold press">
                    <Plus className="w-3.5 h-3.5" /> 추가
                  </button>
                </div>
                {routines.map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="운동명"
                      value={r.name}
                      onChange={e => updateRoutine(i, 'name', e.target.value)}
                      className="flex-[2] px-3 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                    <input
                      type="number"
                      placeholder="세트"
                      value={r.sets}
                      onChange={e => updateRoutine(i, 'sets', e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                    <input
                      type="number"
                      placeholder="횟수"
                      value={r.reps}
                      onChange={e => updateRoutine(i, 'reps', e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                    {routines.length > 1 && (
                      <button onClick={() => removeRoutine(i)} className="text-gray-300 hover:text-red-400 press px-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* STEP 1: 사진 선택 */}
        {step === 1 && (
          <>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">이미지 URL 직접 입력</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                />
                <button
                  onClick={() => { setImageUrl(customUrl); setStickerApplied(false) }}
                  disabled={!customUrl}
                  className="px-4 py-3 bg-[#00D4FF] text-white rounded-2xl text-sm font-bold press disabled:opacity-40"
                >
                  적용
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">추천 이미지 (Unsplash)</label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_IMAGES[category].map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { setImageUrl(url); setStickerApplied(false) }}
                    className={`relative rounded-2xl overflow-hidden aspect-square press border-2 transition-all ${
                      imageUrl === url ? 'border-[#00D4FF] shadow-md shadow-cyan-200' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {imageUrl === url && (
                      <div className="absolute inset-0 bg-[#00D4FF]/20 flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {previewImage && (
              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>
                <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </>
        )}

        {/* STEP 2: 스티커 합성 */}
        {step === 2 && (
          <>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>
              <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              {stickerApplied && (
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-2xl p-3 text-white border border-white/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[#00D4FF] font-black text-xs">⚡ FITSTA</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span>🔥 오운완</span>
                    <span>💪 운동완료</span>
                  </div>
                  <div className="flex gap-3 text-xs mt-0.5 text-gray-300">
                    <span>목표 {exerciseGoal}분 달성!</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setStickerApplied(!stickerApplied)}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 press transition-all ${
                stickerApplied
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white shadow-lg shadow-cyan-200'
              }`}
            >
              <Sparkles className="w-4.5 h-4.5" />
              {stickerApplied ? '스티커 제거하기' : '✨ 오늘의 기록 스티커 합성하기'}
            </button>

            <div className="bg-cyan-50 rounded-2xl p-4 text-sm text-cyan-700">
              <p className="font-bold mb-1">📸 인스타그램 스토리 스타일</p>
              <p className="text-xs">오늘의 칼로리·운동 시간이 예쁜 스티커로 사진 위에 합성됩니다!</p>
            </div>
          </>
        )}

        {/* STEP 3: 최종 확인 */}
        {step === 3 && (
          <>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>
              <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              {stickerApplied && (
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-2xl p-3 text-white border border-white/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[#00D4FF] font-black text-xs">⚡ FITSTA</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-300">
                    <span>💪 오운완</span>
                    <span>🔥 목표달성</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${category === 'workout' ? 'bg-cyan-100 text-cyan-700' : 'bg-green-100 text-green-700'}`}>
                  {category === 'workout' ? '🏋️ 오운완' : '🥗 식단팁'}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {caption || '(내용 없음)'}
              </p>
            </div>

            <button
              onClick={handlePost}
              disabled={posting}
              className="w-full py-4 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white font-black rounded-2xl shadow-lg shadow-cyan-200 press disabled:opacity-60 text-base"
            >
              {posting ? '게시 중...' : '🚀 피드에 게시하기'}
            </button>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      {step < 3 && (
        <div className="px-4 pb-8 pt-2 border-t border-gray-100 bg-white">
          <button
            onClick={nextStep}
            disabled={step === 0 && !caption.trim()}
            className="w-full py-4 bg-gradient-to-r from-[#00D4FF] to-[#0891B2] text-white font-black rounded-2xl shadow-lg shadow-cyan-200 press disabled:opacity-40 text-base"
          >
            다음 단계 →
          </button>
        </div>
      )}
    </div>
  )
}
