"use client";

import { useEffect, useState } from 'react';
import { supabase, getSafeSession } from '@/lib/supabase';
import { NotificationManager } from '@/lib/notifications';

export default function NotificationHandler() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const setup = async () => {
            const { data: { session } } = await getSafeSession();
            if (session?.user) {
                setUserId(session.user.id);
                
                // Check if admin
                const masters = ['wearabbie@gmail.com', 'admin@wearabbie.com'];
                if (masters.includes(session.user.email || '')) {
                    setIsAdmin(true);
                } else {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                    if (profile?.role === 'admin') setIsAdmin(true);
                }

                // Request notification permission on first mount if logged in
                await NotificationManager.requestPermission();
            }
        };

        setup();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                const masters = ['wearabbie@gmail.com', 'admin@wearabbie.com'];
                setIsAdmin(masters.includes(session.user.email || ''));
                NotificationManager.requestPermission();
            } else {
                setUserId(null);
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = NotificationManager.subscribeToNotifications(userId, isAdmin, (data) => {
            console.log("Real-time notification received:", data);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId, isAdmin]);

    return null; // This component doesn't render anything UI-wise
}
