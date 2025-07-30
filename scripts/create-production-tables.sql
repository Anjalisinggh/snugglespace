-- Create users table for couples
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  partner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partner invitations table
CREATE TABLE IF NOT EXISTS partner_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID REFERENCES users(id) NOT NULL,
  invitee_email VARCHAR(255) NOT NULL,
  invitation_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create content table for dares, orders, and memories
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('dare', 'order', 'memory')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table for hearts, likes, etc.
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'heart',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id, reaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_sender ON content(sender_id);
CREATE INDEX IF NOT EXISTS idx_content_receiver ON content(receiver_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_content ON reactions(content_id);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_code ON partner_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_email ON partner_invitations(invitee_email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile and their partner's" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.uid() = partner_id OR 
    id IN (SELECT partner_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for partner_invitations table
CREATE POLICY "Users can view invitations they sent or received" ON partner_invitations
  FOR SELECT USING (
    auth.uid() = inviter_id OR 
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations" ON partner_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations they received" ON partner_invitations
  FOR UPDATE USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Create policies for content table
CREATE POLICY "Users can view content they sent or received" ON content
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can create content" ON content
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update content they created or received" ON content
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create policies for reactions table
CREATE POLICY "Users can view reactions on content they can see" ON reactions
  FOR SELECT USING (
    content_id IN (
      SELECT id FROM content 
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to generate invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code() RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations() RETURNS void AS $$
BEGIN
  UPDATE partner_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
