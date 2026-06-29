-- =============================================
-- Fitsta : 헬스&식단 커뮤니티 DB 스키마
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. 사용자 프로필 테이블 (auth.users와 연동)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  height NUMERIC(5,1),
  weight NUMERIC(5,1),
  activity_level TEXT DEFAULT 'moderate' CHECK (activity_level IN ('low', 'moderate', 'high')),
  daily_calorie_goal INTEGER DEFAULT 2000,
  daily_exercise_goal INTEGER DEFAULT 60,
  streak_count INTEGER DEFAULT 0,
  last_record_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 게시물 테이블
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  caption TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  category TEXT DEFAULT 'workout' CHECK (category IN ('workout', 'diet')),
  routine_data JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 댓글 테이블
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 팔로우 테이블
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- 5. 일일 기록 테이블 (홈 대시보드용)
CREATE TABLE public.daily_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  record_date DATE DEFAULT CURRENT_DATE,
  calories_consumed INTEGER DEFAULT 0,
  water_intake INTEGER DEFAULT 0,
  exercise_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- =============================================
-- RLS (Row Level Security) 정책 설정
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- profiles: 모두 읽기 가능, 본인만 수정
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- posts: 모두 읽기 가능, 본인만 작성/수정/삭제
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_own_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_own_update" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_own_delete" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- comments: 모두 읽기 가능, 인증된 사용자 작성, 본인만 삭제
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_auth_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_delete" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- follows: 모두 읽기, 본인 팔로우 관리
CREATE POLICY "follows_public_read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_own_insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_own_delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- daily_records: 본인만 접근
CREATE POLICY "daily_own_read" ON public.daily_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_own_insert" ON public.daily_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_own_update" ON public.daily_records FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 트리거: 회원가입 시 프로필 자동 생성
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 좋아요 증가 함수 (RPC)
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 샘플 데이터 (선택사항 - 테스트용)
-- 실제 서비스에서는 삭제하세요
-- =============================================

-- INSERT INTO public.posts (user_id, caption, image_url, likes_count, category)
-- VALUES (
--   '실제-user-id',
--   '오늘도 오운완 💪 벤치프레스 80kg 3세트 완료! #오운완 #헬스 #Fitsta',
--   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
--   12, 'workout'
-- );
