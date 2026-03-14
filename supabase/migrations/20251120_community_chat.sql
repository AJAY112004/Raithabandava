-- Create community_messages table for realtime chat
CREATE TABLE IF NOT EXISTS community_messages (
  id BIGSERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_messages_ts ON community_messages(ts DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all messages
CREATE POLICY "Anyone can read community messages"
  ON community_messages
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert messages
CREATE POLICY "Authenticated users can insert messages"
  ON community_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON community_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- Grant permissions
GRANT SELECT ON community_messages TO anon, authenticated;
GRANT INSERT ON community_messages TO authenticated;
GRANT DELETE ON community_messages TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE community_messages_id_seq TO authenticated;
