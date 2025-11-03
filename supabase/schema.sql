-- AuthenticAI Wellness Journal Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'therapist', 'admin')),
    therapy_goals TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journals table
CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood TEXT CHECK (mood IN ('very_low', 'low', 'neutral', 'good', 'very_good')),
    tags TEXT[] DEFAULT '{}',
    is_voice BOOLEAN DEFAULT FALSE,
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapist feedback table
CREATE TABLE IF NOT EXISTS therapist_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    entry_id UUID REFERENCES journals(id) ON DELETE SET NULL,
    is_encouragement BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Access log table (therapist access to client data)
CREATE TABLE IF NOT EXISTS access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT
);

-- Error log table
CREATE TABLE IF NOT EXISTS error_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    sanitized BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);

-- Therapist-Client relationships (optional, for explicit assignments)
CREATE TABLE IF NOT EXISTS therapist_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(therapist_id, client_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_created_at ON journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journals_mood ON journals(mood);
CREATE INDEX IF NOT EXISTS idx_feedback_client_id ON therapist_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_feedback_therapist_id ON therapist_feedback(therapist_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_log_therapist_id ON access_log(therapist_id);
CREATE INDEX IF NOT EXISTS idx_access_log_client_id ON access_log(client_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Therapists can view client profiles"
    ON users FOR SELECT
    USING (
        auth.uid() IN (
            SELECT therapist_id FROM therapist_clients WHERE client_id = id
        )
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'therapist'
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Journals policies
CREATE POLICY "Clients can view their own journals"
    ON journals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Therapists can view their clients' journals"
    ON journals FOR SELECT
    USING (
        auth.uid() IN (
            SELECT therapist_id FROM therapist_clients WHERE client_id = user_id
        )
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'therapist'
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Clients can insert their own journals"
    ON journals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update their own journals"
    ON journals FOR UPDATE
    USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Clients can view feedback for them"
    ON therapist_feedback FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Therapists can view their sent feedback"
    ON therapist_feedback FOR SELECT
    USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create feedback"
    ON therapist_feedback FOR INSERT
    WITH CHECK (
        auth.uid() = therapist_id
        AND (
            (SELECT role FROM users WHERE id = auth.uid()) = 'therapist'
            OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        )
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON therapist_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

