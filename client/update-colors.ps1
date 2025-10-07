# PowerShell script to replace custom Tailwind colors with default colors
# Run this script from the client directory

$replacements = @{
    # Primary colors
    'primary-50' = 'blue-50'
    'primary-100' = 'blue-100'
    'primary-200' = 'blue-200'
    'primary-300' = 'blue-300'
    'primary-400' = 'blue-400'
    'primary-500' = 'blue-500'
    'primary-600' = 'blue-600'
    'primary-700' = 'blue-700'
    'primary-800' = 'blue-800'
    'primary-900' = 'blue-900'
    
    # Clinical colors (neutral grays)
    'clinical-50' = 'gray-50'
    'clinical-100' = 'gray-100'
    'clinical-200' = 'gray-200'
    'clinical-300' = 'gray-300'
    'clinical-400' = 'gray-400'
    'clinical-500' = 'gray-500'
    'clinical-600' = 'gray-600'
    'clinical-700' = 'gray-700'
    'clinical-800' = 'gray-800'
    'clinical-900' = 'gray-900'
}

$files = Get-ChildItem -Path "src" -Include *.jsx,*.js -Recurse

$totalFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content -replace $key, $replacements[$key]
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles++
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nCompleted!" -ForegroundColor Cyan
Write-Host "Total files scanned: $totalFiles" -ForegroundColor Yellow
Write-Host "Files modified: $modifiedFiles" -ForegroundColor Green
