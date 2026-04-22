-- =====================================================
-- Migration Script: Add Registration Fields to Employee
-- Date: 2026-04-22
-- Purpose: Adds EmpEmail, EmpPhone, EmpDesignation, EmpStatus
--          columns to Employee table if they do not exist.
--          Safe to run multiple times (idempotent).
-- =====================================================

USE TimeChime;
GO

PRINT '--- Starting Employee table migration ---';
GO

-- Add EmpEmail
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'EmpEmail' AND Object_ID = Object_ID(N'dbo.Employee')
)
BEGIN
    ALTER TABLE dbo.Employee ADD EmpEmail VARCHAR(100) NULL;
    PRINT 'Added column: EmpEmail';
END
ELSE
    PRINT 'Column EmpEmail already exists - skipped';
GO

-- Add EmpPhone
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'EmpPhone' AND Object_ID = Object_ID(N'dbo.Employee')
)
BEGIN
    ALTER TABLE dbo.Employee ADD EmpPhone VARCHAR(20) NULL;
    PRINT 'Added column: EmpPhone';
END
ELSE
    PRINT 'Column EmpPhone already exists - skipped';
GO

-- Add EmpDesignation
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'EmpDesignation' AND Object_ID = Object_ID(N'dbo.Employee')
)
BEGIN
    ALTER TABLE dbo.Employee ADD EmpDesignation VARCHAR(100) NULL;
    PRINT 'Added column: EmpDesignation';
END
ELSE
    PRINT 'Column EmpDesignation already exists - skipped';
GO

-- Add EmpStatus (with default 'Active')
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'EmpStatus' AND Object_ID = Object_ID(N'dbo.Employee')
)
BEGIN
    ALTER TABLE dbo.Employee
        ADD EmpStatus VARCHAR(20) NOT NULL
        CONSTRAINT DF_Employee_EmpStatus DEFAULT 'Active';
    PRINT 'Added column: EmpStatus (default Active)';
END
ELSE
    PRINT 'Column EmpStatus already exists - skipped';
GO

-- =====================================================
-- Backfill sample data for existing 3 employees (only
-- where the values are currently NULL). Safe to re-run.
-- =====================================================
UPDATE dbo.Employee
SET EmpEmail = 'pranav.agarwal@company.com',
    EmpPhone = '+91-9876543210',
    EmpDesignation = ISNULL(EmpDesignation, 'Senior Developer')
WHERE EmpID = 1 AND (EmpEmail IS NULL OR EmpPhone IS NULL);

UPDATE dbo.Employee
SET EmpEmail = 'john.smith@company.com',
    EmpPhone = '+91-9876543212',
    EmpDesignation = ISNULL(EmpDesignation, 'HR Manager')
WHERE EmpID = 2 AND (EmpEmail IS NULL OR EmpPhone IS NULL);

UPDATE dbo.Employee
SET EmpEmail = 'sarah.johnson@company.com',
    EmpPhone = '+91-9876543214',
    EmpDesignation = ISNULL(EmpDesignation, 'Finance Director')
WHERE EmpID = 3 AND (EmpEmail IS NULL OR EmpPhone IS NULL);
GO

PRINT '--- Migration complete ---';
GO

-- =====================================================
-- Verify: show current Employee schema + data
-- =====================================================
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Employee'
ORDER BY ORDINAL_POSITION;
GO

SELECT EmpID, EmpName, EmpEmail, EmpPhone, EmpDesignation, EmpStatus
FROM dbo.Employee;
GO
