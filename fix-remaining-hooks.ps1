# PowerShell script to fix remaining React Hook warnings

# List of files with single fetchFunction pattern (same pattern as dashboard)
$singleFetchFiles = @(
    "pages/admin/reports.js:fetchReports",
    "pages/staff/dashboard.js:fetchDashboardData",
    "pages/staff/schedule.js:fetchSchedule",
    "pages/staff/class-analytics.js:fetchData",
    "pages/staff/student-reports.js:fetchStudents",
    "pages/student/dashboard.js:fetchDashboardData",
    "pages/student/attendance.js:fetchAttendance",
    "pages/student/grades.js:fetchGrades",
    "pages/student/fees.js:fetchFees"
)

Write-Output "Fixing React Hook warnings in remaining files..."
Write-Output "Files to process: $($singleFetchFiles.Count)"

