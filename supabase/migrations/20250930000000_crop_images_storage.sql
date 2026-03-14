-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for crop-images bucket
-- Allow authenticated users to read all files
CREATE POLICY "Allow authenticated users to read crop images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'crop-images');

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated users to upload crop images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'crop-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own crop images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'crop-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own crop images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'crop-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);