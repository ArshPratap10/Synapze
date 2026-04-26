$files = @(
  "src/components/ui/ProgressAnalytics.jsx",
  "src/components/ui/NutrientBar.jsx",
  "src/components/ui/JournalTab.jsx",
  "src/components/ui/AICoach.jsx",
  "src/components/ui/NeuralScoreParticles.jsx"
)
foreach ($f in $files) {
  if (Test-Path $f) {
    $c = Get-Content $f -Raw
    $c = $c -replace '#2d2256','#f0ecff'
    $c = $c -replace '#5b5191','#a09abc'
    $c = $c -replace '#8b82b0','#6b6490'
    $c = $c -replace '#b8b0d0','#3d3860'
    $c = $c -replace '#7c6bc4','#00f3ff'
    $c = $c -replace '#a78bfa','#8b5cf6'
    $c = $c -replace '#e9a8fc','#00f3ff'
    $c = $c -replace '#f0eaf8','#0e0b1a'
    $c = $c -replace '#d4c8e8','rgba(255,255,255,0.08)'
    $c = $c -replace '#c4bedd','#3d3860'
    $c = $c -replace '#9590b0','#6b6490'
    $c = $c -replace '#e4daf2','rgba(255,255,255,0.06)'
    Set-Content $f $c -Encoding UTF8
    Write-Host "Updated $f"
  }
}
