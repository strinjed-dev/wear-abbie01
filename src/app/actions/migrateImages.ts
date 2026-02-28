'use server'

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// This requires the Service Role Key for mass uploads and DB updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function migrateLocalImages() {
    if (!serviceRoleKey) {
        return { success: false, message: "SUPABASE_SERVICE_ROLE_KEY is missing in .env" };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const publicPerfumesDir = path.join(process.cwd(), 'public', 'perfumes');

    if (!fs.existsSync(publicPerfumesDir)) {
        return { success: false, message: "public/perfumes directory not found" };
    }

    const files = fs.readdirSync(publicPerfumesDir);
    const results = [];

    for (const fileName of files) {
        try {
            const filePath = path.join(publicPerfumesDir, fileName);
            const fileContent = fs.readFileSync(filePath);

            // Upload to Supabase Bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('perfume-images')
                .upload(fileName, fileContent, {
                    upsert: true,
                    contentType: fileName.endsWith('.png') ? 'image/png' : 'image/jpeg'
                });

            if (uploadError) {
                results.push({ fileName, status: 'error', error: uploadError.message });
                continue;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('perfume-images')
                .getPublicUrl(fileName);

            // Update Products in DB
            // Find products using this local path e.g. /perfumes/xyz.jpg
            const localPath = `/perfumes/${fileName}`;
            const { data: products, error: dbError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('image_url', localPath)
                .select(); // find products using old local paths

            results.push({ fileName, status: 'success', publicUrl, updatedCount: products?.length || 0 });

        } catch (err: any) {
            results.push({ fileName, status: 'crash', error: err.message });
        }
    }

    return { success: true, results };
}
