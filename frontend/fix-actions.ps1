$file = "src/app/actions.js"
$lines = Get-Content $file

# Lines 320-329 need replacing (0-indexed: 319-328)
$before = $lines[0..318]
$after = $lines[329..($lines.Count - 1)]

$replacement = @(
'    data.confidenceScore = 0.85;',
'    data.generationSource = ''ai'';',
'    data.modelId = ''gemini-2.5-flash'';',
'    data.promptHash = description.slice(0, 20);',
'    data.fiber = data.fiber || 0;',
'    data.sodium = data.sodium || 0;',
'',
'    const preview = data;',
'    return { success: true, preview };'
)

$newContent = $before + $replacement + $after
Set-Content $file $newContent -Encoding UTF8
Write-Host "Fixed actions.js"
