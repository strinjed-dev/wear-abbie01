import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Upload image to Supabase storage bucket "perfume-images"
export const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}.${fileExt}`;
    const { data, error } = await supabase.storage
        .from('perfume-images')
        .upload(fileName, file, { upsert: true });

    if (error) {
        console.error("Supabase Storage Upload Error Details:", error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage.from('perfume-images').getPublicUrl(fileName);
    return publicUrl;
};
