import { createContext, useContext, useState } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  // TODO: 새로운 인증 서비스 연결 예정
  const signUp = async ({ email, password, username, displayName }) => {
    return { data: null, error: { message: '인증 서비스 준비 중입니다.' } }
  }

  const signIn = async ({ email, password }) => {
    return { data: null, error: { message: '인증 서비스 준비 중입니다.' } }
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates) => {
    setProfile(prev => ({ ...prev, ...updates }))
    return { error: null }
  }

  const refreshProfile = () => {}

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
