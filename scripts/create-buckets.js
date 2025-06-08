import { createClient } from '@supabase/supabase-js';

// Update these with your local Supabase settings
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.vI9obAHOGyVVKa3pD--kJlyxp-Z2zV9UUMAhKpNLAcU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createBucket(name) {
  const { data, error } = await supabase.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
  });
  if (error && !error.message.includes('already exists')) {
    console.error(`Error creating bucket '${name}':`, error.message);
  } else {
    console.log(`Bucket '${name}' created or already exists.`);
  }
}

(async () => {
  await createBucket('avatars');
  await createBucket('posts');
  await createBucket('cover_photos');
  console.log('Done!');
})(); 