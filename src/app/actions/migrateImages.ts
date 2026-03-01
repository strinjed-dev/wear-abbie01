'use server'

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// This requires the Service Role Key for mass uploads and DB updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function syncCatalogToSupabase() {
    if (!serviceRoleKey) {
        return { success: false, message: "SUPABASE_SERVICE_ROLE_KEY is missing in .env" };
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Read the JSON catalog
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'products.json');
    if (!fs.existsSync(jsonPath)) {
        return { success: false, message: "Catalog JSON not found" };
    }

    const catalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const publicPerfumesDir = path.join(process.cwd(), 'public', 'perfumes');

    const results = {
        inserted: 0,
        uploaded: 0,
        errors: [] as string[]
    };

    // 2. Sync Products to DB
    for (const item of catalog) {
        try {
            const { error: upsertError } = await supabase
                .from('products')
                .upsert({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    image_url: item.image, // Temporary local path
                    description: item.description,
                    stock: item.inStock ? 50 : 0,
                    size: '100ml',
                    type: 'Perfume',
                    is_active: true,
                    is_cod: true,
                    fragrance_notes: ''
                });

            if (upsertError) {
                results.errors.push(`DB Error (${item.name}): ${upsertError.message}`);
                continue;
            }
            results.inserted++;

            // 3. Check if we have the image locally to upload
            const imgFileName = path.basename(item.image);
            const localImgPath = path.join(publicPerfumesDir, imgFileName);

            if (fs.existsSync(localImgPath)) {
                const fileBuffer = fs.readFileSync(localImgPath);

                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('perfume-images')
                    .upload(imgFileName, fileBuffer, {
                        upsert: true,
                        contentType: imgFileName.endsWith('.png') ? 'image/png' : 'image/jpeg'
                    });

                if (uploadError) {
                    results.errors.push(`Upload Error (${imgFileName}): ${uploadError.message}`);
                } else {
                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('perfume-images')
                        .getPublicUrl(imgFileName);

                    // Update DB with Public URL
                    await supabase
                        .from('products')
                        .update({ image_url: publicUrl })
                        .eq('id', item.id);

                    results.uploaded++;
                }
            }
        } catch (err: any) {
            results.errors.push(`Crash (${item.name}): ${err.message}`);
        }
    }

    return { success: true, ...results };
}
