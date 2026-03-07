"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

const BRAND_GOLD = '#D4AF37';
const BRAND_BROWN = '#3E2723';
const BRAND_BLACK = '#121212';

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Wear Abbie Concierge <concierge@wear-abbie.com>',
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Email sending error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email sending exception:', error);
        return { success: false, error };
    }
};

/**
 * 1. Welcome Email Template
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@300;400;800&display=swap');
                body { font-family: 'Outfit', sans-serif; color: ${BRAND_BLACK}; line-height: 1.6; margin: 0; padding: 0; }
                .wrapper { background-color: #fafafa; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
                .hero { background: ${BRAND_BLACK}; color: ${BRAND_GOLD}; padding: 60px 40px; text-align: center; }
                .hero h1 { font-family: 'Playfair Display', serif; font-size: 32px; margin: 0; letter-spacing: 4px; text-transform: uppercase; }
                .content { padding: 50px 40px; }
                .btn { background: ${BRAND_GOLD}; color: white; padding: 18px 35px; text-decoration: none; border-radius: 100px; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; display: inline-block; margin-top: 30px; }
                .footer { padding: 40px; text-align: center; font-size: 10px; color: #a1a1a1; text-transform: uppercase; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="hero">
                        <h1>Welcome to our<br>Boutique Community</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 18px; font-weight: 300;">Hello <strong>${userName}</strong>,</p>
                        <p>Welcome to <strong>Wear Abbie</strong>. We are delighted to have you as part of our community dedicated to the art of luxury fragrance.</p>
                        <p>Your membership grants you priority access to our limited releases and personalized scent updates.</p>
                        <div style="text-align: center;">
                            <a href="https://wear-abbie.vercel.app/shop" class="btn">Explore the Collection</a>
                        </div>
                    </div>
                    <div class="footer">
                        Wear Abbie &copy; 2026. All Rights Reserved.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: 'Welcome to Wear Abbie',
        html
    });
};

/**
 * 2. Luxury Receipt Template
 */
export const sendOrderReceiptEmail = async (userEmail: string, orderData: any) => {
    const itemsHtml = orderData.items.map((item: any) => `
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 800; font-size: 13px; text-transform: uppercase;">${item.name}</p>
                <p style="margin: 0; font-size: 11px; color: #999;">Quantity: ${item.quantity}</p>
            </div>
            <p style="margin: 0; font-weight: 800; color: ${BRAND_BLACK};">₦${(item.price * item.quantity).toLocaleString()}</p>
        </div>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@400;800&display=swap');
                body { font-family: 'Outfit', sans-serif; color: ${BRAND_BLACK}; margin: 0; }
                .wrapper { background: #fafafa; padding: 40px 20px; }
                .card { background: white; max-width: 600px; margin: 0 auto; border-radius: 40px; padding: 60px; position: relative; }
                .gold-bar { position: absolute; top: 0; left: 0; right: 0; height: 10px; background: ${BRAND_GOLD}; border-radius: 40px 40px 0 0; }
                .header { text-align: center; margin-bottom: 50px; }
                .order-id { font-size: 10px; font-weight: 900; color: #D4AF37; text-transform: uppercase; letter-spacing: 3px; }
                .total-box { background: ${BRAND_BROWN}; color: white; padding: 30px; border-radius: 24px; text-align: center; margin: 40px 0; }
                .total-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6; }
                .total-amount { font-size: 32px; font-weight: 800; margin-top: 10px; }
                .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #a1a1a1; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 20px; }
                .footer { text-align: center; font-size: 10px; color: #ccc; margin-top: 40px; text-transform: uppercase; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="gold-bar"></div>
                    <div class="header">
                        <p class="order-id">Order Ref: #${orderData.id.slice(-8).toUpperCase()}</p>
                        <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; margin-top: 10px;">Your Selection is Confirmed.</h1>
                    </div>
                    
                    <p>Dear ${orderData.customer_name},</p>
                    <p>Thank you for choosing Wear Abbie. We have received your order and are currently curating your fragrance selection for dispatch.</p>

                    <div class="total-box">
                        <div class="total-label">Total Investment</div>
                        <div class="total-amount">₦${orderData.total.toLocaleString()}</div>
                    </div>

                    <div class="section-title">Investment Summary</div>
                    ${itemsHtml}

                    <div style="margin-top: 40px; padding: 25px; background: #f9f9f9; border-radius: 20px; border: 1px dashed #eee;">
                        <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase;">Tracking Reference</p>
                        <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: 800;">${orderData.tracking_code}</p>
                    </div>

                    <div class="footer">
                        Wear Abbie Support &copy; 2026
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Order Confirmation: #${orderData.id.slice(-8).toUpperCase()}`,
        html
    });
};

/**
 * 3. Back in Stock Notification
 */
export const sendBackInStockEmail = async (userEmail: string, userName: string, productName: string, productLink: string) => {
    const html = `
        <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 40px; text-align: center;">
            <div style="background: ${BRAND_GOLD}; color: white; display: inline-block; padding: 8px 15px; border-radius: 100px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Restocked</div>
            <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; margin: 0 0 20px 0;">It's Back in the Boutique.</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Hello ${userName}, the wait is over. The <strong>${productName}</strong> has been restocked and is ready for your collection.</p>
            <a href="${productLink}" style="background: ${BRAND_BLACK}; color: ${BRAND_GOLD}; padding: 20px 40px; text-decoration: none; border-radius: 100px; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; display: inline-block;">Secure Yours Now</a>
            <p style="font-size: 10px; color: #999; margin-top: 50px; text-transform: uppercase; letter-spacing: 1px;">Wear Abbie Signature Collection</p>
        </div>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Back in Stock: ${productName} — Wear Abbie`,
        html
    });
};

/**
 * 4. Order Status Update Notification
 */
export const sendOrderStatusUpdateEmail = async (userEmail: string, userName: string, orderId: string, newStatus: string) => {
    const statusMessages: Record<string, string> = {
        'processing': "We've verified your payment and are currently preparing your fragrance for dispatch.",
        'shipped': "Your order has been dispatched and is currently on its way to you.",
        'delivered': "Our courier has confirmed the delivery of your order. We hope you enjoy your new fragrance.",
        'cancelled': "Your order has been cancelled. If you didn't request this, please contact our support team immediately."
    };

    const displayStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    const message = statusMessages[newStatus.toLowerCase()] || `Your order status has been updated to ${displayStatus}.`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:ital,wght@0,300;0,400;0,800;1,400&display=swap');
                body { font-family: 'Outfit', sans-serif; color: ${BRAND_BLACK}; line-height: 1.6; margin: 0; padding: 0; }
                .wrapper { background-color: #fafafa; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
                .header { background: ${BRAND_BLACK}; color: ${BRAND_GOLD}; padding: 40px; text-align: center; }
                .header p { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px 0; opacity: 0.6; }
                .header h1 { font-family: 'Playfair Display', serif; font-size: 28px; margin: 0; letter-spacing: 2px; }
                .content { padding: 50px 40px; }
                .status-badge { display: inline-block; background: ${BRAND_GOLD}; color: white; padding: 8px 20px; border-radius: 100px; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; margin-bottom: 30px; }
                .footer { padding: 40px; text-align: center; font-size: 10px; color: #a1a1a1; text-transform: uppercase; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <p>Order Update • #${orderId.slice(-8).toUpperCase()}</p>
                        <h1>Refining Your Experience</h1>
                    </div>
                    <div class="content">
                        <div class="status-badge">${displayStatus}</div>
                        <p style="font-size: 18px; font-weight: 300;">Hello <strong>${userName}</strong>,</p>
                        <p>${message}</p>
                        <p>You can track your order live on our platform using the link below:</p>
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="https://wear-abbie.vercel.app/dashboard" style="background: ${BRAND_BLACK}; color: ${BRAND_GOLD}; padding: 18px 35px; text-decoration: none; border-radius: 100px; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; display: inline-block;">Track Your Order</a>
                        </div>
                    </div>
                    <div class="footer">
                        Wear Abbie &copy; 2026. Smelling Nice is Our Priority.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Update on Order #${orderId.slice(-8).toUpperCase()} — Wear Abbie`,
        html
    });
};
