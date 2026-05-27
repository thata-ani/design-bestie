# Design Roast Battle - Supabase Setup

## 1. Create Storage Bucket

Go to Supabase Dashboard → Storage → Create Bucket

- **Name**: `battle-images`
- **Public**: Yes (enable public access)
- **File size limit**: 50MB
- **Allowed MIME types**: image/png, image/jpeg, image/jpg

## 2. Create Database Tables

Go to Supabase Dashboard → SQL Editor → New Query

Run this SQL:

```sql
-- Create battles table
CREATE TABLE IF NOT EXISTS battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES auth.users(id),
  creator_name TEXT NOT NULL,
  creator_image_url TEXT NOT NULL,
  challenger_id UUID REFERENCES auth.users(id),
  challenger_name TEXT,
  challenger_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create battle_messages table
CREATE TABLE IF NOT EXISTS battle_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS battles_slug_idx ON battles(slug);
CREATE INDEX IF NOT EXISTS battles_status_idx ON battles(status);
CREATE INDEX IF NOT EXISTS battle_messages_battle_id_idx ON battle_messages(battle_id);

-- Enable Row Level Security
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for battles
CREATE POLICY "Anyone can view battles" ON battles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create battles" ON battles
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator and challenger can update their battle" ON battles
  FOR UPDATE USING (
    auth.uid() = creator_id OR auth.uid() = challenger_id
  );

-- RLS Policies for battle_messages
CREATE POLICY "Anyone can view messages" ON battle_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create messages" ON battle_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

## 3. Create Lottie Animation Files (Optional)

Create these files in the `public` folder:

- `/public/battle-waiting.json` - Animation for waiting state
- `/public/battle-completed.json` - Animation for completed state

You can find free Lottie animations at https://lottiefiles.com/

Good options:
- Waiting: Search for "waiting" or "loading" animations
- Completed: Search for "trophy" or "winner" animations

## 4. Test the Feature

1. Visit http://localhost:3000
2. Upload a design and get analysis results
3. Click "⚔️ Roast Battle" button
4. You'll be redirected to `/battle/{slug}`
5. Copy the battle link and share it
6. Another user can join by visiting the link and uploading their design
7. The AI will roast both designs
8. Designers can defend their work
9. AI picks a winner

## Notes

- The feature is Pro-only (currently all users can access for testing)
- Uses Claude Haiku 4.5 for all AI responses
- Messages are stored in `battle_messages` table
- Battles can be in 3 states: waiting, in_progress, completed
