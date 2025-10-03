-- Basic FRC Scouting Database Schema for Web Dashboard Demo
-- Run this in your Supabase SQL Editor to create the basic tables

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_number INTEGER UNIQUE NOT NULL,
    team_name TEXT,
    regional TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    regional TEXT NOT NULL,
    scouter_name TEXT,

    -- Pregame
    starting_position TEXT CHECK (starting_position IN ('Amp', 'Middle', 'Source')),

    -- Autonomous
    auto_taxi BOOLEAN DEFAULT FALSE,
    auto_m1 INTEGER DEFAULT 0,
    auto_m2 INTEGER DEFAULT 0,
    auto_m3 INTEGER DEFAULT 0,
    auto_m4 INTEGER DEFAULT 0,
    auto_m5 INTEGER DEFAULT 0,
    auto_s1 INTEGER DEFAULT 0,
    auto_s2 INTEGER DEFAULT 0,
    auto_s3 INTEGER DEFAULT 0,
    auto_r INTEGER DEFAULT 0,

    -- Teleoperation
    teleop_amp_attempts INTEGER DEFAULT 0,
    teleop_amp_scored INTEGER DEFAULT 0,
    teleop_speaker_attempts INTEGER DEFAULT 0,
    teleop_speaker_scored INTEGER DEFAULT 0,
    teleop_ground_intake INTEGER DEFAULT 0,
    teleop_source_intake INTEGER DEFAULT 0,

    -- Endgame
    endgame_climb TEXT CHECK (endgame_climb IN ('Nothing', 'Park', 'Single Climb', 'Double Climb', 'Triple Climb')),
    endgame_trap_count INTEGER DEFAULT 0 CHECK (endgame_trap_count >= 0 AND endgame_trap_count <= 3),

    -- Postgame
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    robot_disabled BOOLEAN DEFAULT FALSE,
    played_defense BOOLEAN DEFAULT FALSE,
    comments TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, match_number)
);

-- Robot info table (simplified)
CREATE TABLE IF NOT EXISTS robot_info (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    regional TEXT NOT NULL,

    can_score_amp BOOLEAN DEFAULT FALSE,
    can_score_speaker BOOLEAN DEFAULT FALSE,
    can_ground_intake BOOLEAN DEFAULT FALSE,
    can_source_intake BOOLEAN DEFAULT FALSE,
    can_climb BOOLEAN DEFAULT FALSE,

    robot_weight DECIMAL(5,2),
    robot_height DECIMAL(4,1),
    drive_type TEXT,

    notes TEXT,
    scouter_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(team_id, regional)
);

-- Sample data for testing
INSERT INTO teams (team_number, team_name, regional) VALUES
(589, 'Falkon Robotics', 'Orange County'),
(254, 'The Cheesy Poofs', 'Orange County'),
(1678, 'Citrus Circuits', 'Orange County'),
(2471, 'Team Mean Machine', 'Orange County')
ON CONFLICT (team_number) DO NOTHING;

-- Sample matches
INSERT INTO matches (
    team_id, match_number, regional, starting_position,
    auto_taxi, auto_m1, auto_s1,
    teleop_amp_attempts, teleop_amp_scored,
    teleop_speaker_attempts, teleop_speaker_scored,
    endgame_climb, endgame_trap_count,
    driver_rating, scouter_name
) VALUES
(1, 1, 'Orange County', 'Middle', TRUE, 2, 1, 5, 4, 10, 8, 'Single Climb', 1, 4, 'Demo User'),
(1, 2, 'Orange County', 'Amp', TRUE, 1, 2, 3, 3, 12, 9, 'Double Climb', 0, 5, 'Demo User'),
(2, 1, 'Orange County', 'Source', FALSE, 0, 3, 8, 6, 15, 12, 'Triple Climb', 2, 3, 'Demo User'),
(3, 1, 'Orange County', 'Middle', TRUE, 3, 1, 4, 4, 8, 6, 'Single Climb', 0, 4, 'Demo User'),
(4, 1, 'Orange County', 'Amp', FALSE, 1, 0, 6, 5, 11, 9, 'Park', 1, 3, 'Demo User')
ON CONFLICT (team_id, match_number) DO NOTHING;

-- Sample robot info
INSERT INTO robot_info (team_id, regional, can_score_amp, can_score_speaker, can_climb, robot_weight, drive_type, scouter_name) VALUES
(1, 'Orange County', TRUE, TRUE, TRUE, 125.5, 'Swerve Drive', 'Pit Scout'),
(2, 'Orange County', TRUE, TRUE, TRUE, 118.3, 'Tank Drive', 'Pit Scout'),
(3, 'Orange County', FALSE, TRUE, TRUE, 132.1, 'Mecanum Drive', 'Pit Scout'),
(4, 'Orange County', TRUE, FALSE, FALSE, 98.7, 'Tank Drive', 'Pit Scout')
ON CONFLICT (team_id, regional) DO NOTHING;