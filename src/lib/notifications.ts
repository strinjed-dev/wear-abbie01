"use client";

import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/1726/1726-preview.mp3'; // More premium double-chime for luxury feel

export class NotificationManager {
    private static audio: HTMLAudioElement | null = null;

    private static initAudio() {
        if (typeof window !== 'undefined' && !this.audio) {
            this.audio = new Audio(NOTIFICATION_SOUND_URL);
        }
    }

    static async requestPermission() {
        if (typeof window === 'undefined') return false;
        
        if (!("Notification" in window)) {
            console.warn("This browser does not support desktop notifications.");
            return false;
        }

        if (Notification.permission === "granted") return true;

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }

        return false;
    }

    static async notify(title: string, body: string, icon: string = '/logo.png') {
        if (typeof window === 'undefined') return;

        this.initAudio();
        
        // Play sound
        if (this.audio) {
            this.audio.play().catch(e => console.warn("Audio play failed:", e));
        }

        // Show browser notification
        if (Notification.permission === "granted") {
            try {
                const n = new Notification(title, {
                    body,
                    icon,
                });
                
                n.onclick = () => {
                    window.focus();
                    n.close();
                };
            } catch (err) {
                console.error("Browser notification failed:", err);
            }
        }
    }

    /**
     * Set up real-time notification listeners for a specific user or admin
     */
    static subscribeToNotifications(userId: string, isAdmin: boolean, onNotification: (payload: any) => void) {
        if (!userId) return;

        // Listen for new notifications in the 'notifications' table
        const channel = supabase
            .channel(`public:notifications:user_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const { title, message } = payload.new;
                    this.notify(title || "New Notification", message || "You have a new update.");
                    onNotification(payload.new);
                }
            )
            .subscribe();

        // If admin, also listen for new orders
        let orderChannel: RealtimeChannel | null = null;
        if (isAdmin) {
            orderChannel = supabase
                .channel('public:orders:admin')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'orders'
                    },
                    (payload) => {
                        const amount = payload.new.total_amount || payload.new.total || 0;
                        this.notify(
                            "🚨 New Order Received!", 
                            `Order #${payload.new.id.substring(0, 8).toUpperCase()} for ₦${amount.toLocaleString()}`
                        );
                        onNotification(payload.new);
                    }
                )
                .subscribe();
        }

        return () => {
            supabase.removeChannel(channel);
            if (orderChannel) supabase.removeChannel(orderChannel);
        };
    }
}
