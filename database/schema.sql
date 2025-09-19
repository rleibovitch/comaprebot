-- Compare Bot Database Schema
-- Created by Horseradish AI

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    week_number INTEGER NOT NULL,
    report_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for better performance
    INDEX idx_client_id (client_id),
    INDEX idx_week_number (week_number),
    INDEX idx_client_week (client_id, week_number),
    
    -- Ensure unique reports per client per week
    UNIQUE(client_id, week_number)
);

-- Create a simple users table for future expansion
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert demo client for MVP
INSERT INTO clients (client_id, name, email) 
VALUES ('client_001', 'Demo Client', 'demo@horseradish.ai')
ON CONFLICT (client_id) DO NOTHING;
