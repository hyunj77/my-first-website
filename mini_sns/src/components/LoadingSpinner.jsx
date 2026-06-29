export default function LoadingSpinner({ text = '로딩 중...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-3">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#00D4FF] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-transparent" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  )
}
