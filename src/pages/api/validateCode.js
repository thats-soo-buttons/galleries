import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, email, agreed_terms, future_marketing_update } = req.body;
  if (!code || !email) {
    return res.status(400).json({ error: 'Missing code or email' });
  }

  // Query Supabase for the access code in the galleries table
  const { data, error } = await supabase
    .from('galleries')
    .select('access_code, folder_id, text')
    .eq('access_code', code)
    .single();
  
  console.log('Supabase query result:', { data, error, code });

  if (error || !data) {
    return res.status(401).json({ success: false, message: 'Invalid code or gallery not found.' });
  }

  // Track access in dmg_users table
  const { error: userError } = await supabase
    .from('dmg_users')
    .insert([
      {
        email,
        access_code: code,
        agreed_terms: agreed_terms || false,
        future_marketing_update: future_marketing_update || false
      }
    ]);

  if (userError) {
    console.error('Error tracking user access:', userError);
    // Continue, but log the error
  }

  // Return folder_id for Google Drive fetch
  return res.status(200).json({
    success: true,
    message: `Access granted to ${data.text} gallery.`,
    folder_id: data.folder_id
  });
}