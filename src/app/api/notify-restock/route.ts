import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBackInStockEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Supabase Webhook payload format
        const { record, old_record } = body;

        // Condition: Stock was 0 and is now > 0
        if (old_record.stock === 0 && record.stock > 0) {
            const productId = record.id;
            const productName = record.name;

            // 1. Fetch all users on the waitlist for this product
            const { data: requests, error: fetchError } = await supabase
                .from('item_requests')
                .select(`
                    id,
                    user_id,
                    profiles (
                        full_name,
                        email
                    )
                `)
                .eq('product_id', productId)
                .eq('status', 'pending');

            if (fetchError) throw fetchError;

            // 2. Send emails to each user
            if (requests && requests.length > 0) {
                const emailPromises = requests.map((req: any) => {
                    const userEmail = req.profiles?.email;
                    const userName = req.profiles?.full_name || 'Valued Member';
                    const productLink = `https://wear-abbie.vercel.app/product/${productId}`;

                    if (userEmail) {
                        return sendBackInStockEmail(userEmail, userName, productName, productLink);
                    }
                    return null;
                }).filter(Boolean);

                await Promise.all(emailPromises);

                // 3. Mark requests as notified
                await supabase
                    .from('item_requests')
                    .update({ status: 'notified' })
                    .eq('product_id', productId)
                    .eq('status', 'pending');
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Notify Restock Route Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
