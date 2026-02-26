-- Migration: Add UNIQUE constraint to prevent duplicate events
-- This ensures events with the same name, start time, and venue cannot be created
-- Run this migration against your PostgreSQL database

-- Step 1: Remove any existing duplicate events (optional - review duplicates first)
-- Uncomment the following query to find existing duplicates:
/*
SELECT 
    "EventName", 
    "StartTime", 
    "VenueID", 
    COUNT(*) as duplicate_count
FROM "Event"
GROUP BY "EventName", "StartTime", "VenueID"
HAVING COUNT(*) > 1;
*/

-- Step 2: Add UNIQUE constraint
-- This prevents duplicate events with same name, start time, and venue
ALTER TABLE "Event" 
ADD CONSTRAINT "unique_event_name_time_venue" 
UNIQUE ("EventName", "StartTime", "VenueID");

-- Note: If you have existing duplicates, you'll need to clean them up first
-- before running this constraint. The query above will help identify them.
