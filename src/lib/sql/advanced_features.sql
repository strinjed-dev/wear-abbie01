-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved
    priority TEXT DEFAULT 'normal', -- normal, high, critical
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own tickets" 
ON support_tickets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" 
ON support_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create item_requests table (Waitlist/Notify Me)
CREATE TABLE IF NOT EXISTS item_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    product_id TEXT REFERENCES products(id),
    status TEXT DEFAULT 'pending', -- pending, notified
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for item_requests
ALTER TABLE item_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own item requests" 
ON item_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own item requests" 
ON item_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create gifting_requests table
CREATE TABLE IF NOT EXISTS gifting_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    gift_message TEXT,
    items JSONB NOT NULL, -- List of products in gift
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for gifting_requests
ALTER TABLE gifting_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own gifting requests" 
ON gifting_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gifting requests" 
ON gifting_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Track stock deduction to prevent double-dipping
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN DEFAULT false;
