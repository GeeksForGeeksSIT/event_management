# Database Migrations

This directory contains SQL migration scripts for the event management system.

## How to Apply Migrations

### Prerequisites
- PostgreSQL database connection
- Database admin privileges

### Running Migrations

#### Option 1: Using psql Command Line
```bash
psql -U your_username -d your_database -f migrations/add_unique_constraint_events.sql
```

#### Option 2: Using pgAdmin
1. Open pgAdmin
2. Connect to your database
3. Open Query Tool
4. Copy and paste the migration SQL
5. Execute the query

#### Option 3: Using Node.js (if you have pg configured)
```javascript
import pool from './src/db.js';
import fs from 'fs';

const migration = fs.readFileSync('./migrations/add_unique_constraint_events.sql', 'utf8');
await pool.query(migration);
```

## Migration History

### 2026-02-26: Add Unique Constraint to Events
- **File**: `add_unique_constraint_events.sql`
- **Purpose**: Prevent duplicate events with same name, start time, and venue
- **Impact**: 
  - Adds UNIQUE constraint on (EventName, StartTime, VenueID)
  - Prevents duplicate event records at database level
  - May fail if existing duplicates exist (clean them first)

## Important Notes

⚠️ **Before Running Migrations**:
1. Always backup your database first
2. Check for existing duplicates using the query in the migration file
3. Clean up any duplicates before applying the constraint
4. Test in development environment first

## Checking for Existing Duplicates

Run this query before applying the migration:

```sql
SELECT 
    "EventName", 
    "StartTime", 
    "VenueID", 
    COUNT(*) as duplicate_count
FROM "Event"
GROUP BY "EventName", "StartTime", "VenueID"
HAVING COUNT(*) > 1;
```

If duplicates exist, decide which records to keep and delete the others before applying the constraint.
