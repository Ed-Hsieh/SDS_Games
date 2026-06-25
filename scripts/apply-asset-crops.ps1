param(
    [string]$Manifest = "scripts\asset-crops\art-v2\generated\combined.manifest.json",
    [string]$ProjectRoot = (Resolve-Path ".").Path,
    [string]$OutputFormat = "webp",
    [int]$WebPQuality = 90,
    [string]$PythonPath = "",
    [switch]$DryRun,
    [switch]$NoOverwrite,
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$categoryFolders = @{
    "equipment" = "src\assets\images\art-v2\equipment"
    "materials" = "src\assets\images\art-v2\materials"
    "blueprints" = "src\assets\images\art-v2\blueprints"
    "shop-items" = "src\assets\images\art-v2\shop-items"
    "shopItems" = "src\assets\images\art-v2\shop-items"
    "crafted-items" = "src\assets\images\art-v2\crafted-items"
    "craftedItems" = "src\assets\images\art-v2\crafted-items"
    "clues" = "src\assets\images\art-v2\clues"
    "town-places" = "src\assets\images\art-v2\town-places"
    "portraits" = "src\assets\images\art-v2\portraits"
    "monsters" = "src\assets\images\art-v2\monsters"
    "dungeon-zone-scenes" = "src\assets\images\art-v2\dungeon-zone-scenes"
    "world-landmarks" = "src\assets\images\art-v2\world-landmarks"
    "map-props" = "src\assets\images\art-v2\map-props"
    "story-relics" = "src\assets\images\art-v2\story-relics"
    "combat-effects" = "src\assets\images\art-v2\combat-effects"
    "backgrounds" = "src\assets\images\art-v2\backgrounds"
}

function Resolve-ProjectPath([string]$PathValue) {
    if ([string]::IsNullOrWhiteSpace($PathValue)) {
        throw "Path value is empty."
    }
    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return [System.IO.Path]::GetFullPath($PathValue)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $PathValue))
}

function Get-DefaultOutput([object]$Entry) {
    if (-not [string]::IsNullOrWhiteSpace($Entry.output)) {
        return Resolve-ProjectPath $Entry.output
    }
    $category = [string]$Entry.category
    if (-not $categoryFolders.ContainsKey($category)) {
        $valid = ($categoryFolders.Keys | Sort-Object) -join ", "
        throw "Unknown category '$category' for entry '$($Entry.id)'. Valid categories: $valid"
    }
    if ([string]::IsNullOrWhiteSpace($Entry.id)) {
        throw "Entry is missing id."
    }
    $extension = if ([string]::IsNullOrWhiteSpace($Entry.format)) { $OutputFormat } else { [string]$Entry.format }
    $extension = $extension.TrimStart(".").ToLowerInvariant()
    return Resolve-ProjectPath (Join-Path $categoryFolders[$category] "$($Entry.id).$extension")
}

function Get-PythonPath {
    if (-not [string]::IsNullOrWhiteSpace($PythonPath)) {
        return $PythonPath
    }
    $bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if (Test-Path -LiteralPath $bundledPython) {
        return $bundledPython
    }
    return "python"
}

function Save-CroppedBitmap([System.Drawing.Bitmap]$Bitmap, [string]$OutputPath) {
    $extension = [System.IO.Path]::GetExtension($OutputPath).ToLowerInvariant()
    if ($extension -eq ".webp") {
        $tempPath = [System.IO.Path]::ChangeExtension([System.IO.Path]::GetTempFileName(), ".png")
        try {
            $Bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $encoder = Resolve-ProjectPath "scripts\encode-webp.py"
            $python = Get-PythonPath
            & $python $encoder $tempPath $OutputPath --quality $WebPQuality
            if ($LASTEXITCODE -ne 0) {
                throw "WebP encoder failed for $OutputPath"
            }
        } finally {
            if (Test-Path -LiteralPath $tempPath) {
                Remove-Item -LiteralPath $tempPath -Force
            }
        }
        return
    }

    $Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Get-Number([object]$Object, [string]$Name, [string]$EntryId) {
    $value = $Object.$Name
    if ($null -eq $value) {
        throw "Entry '$EntryId' crop/resize is missing '$Name'."
    }
    $number = [double]$value
    if ($number -lt 0) {
        throw "Entry '$EntryId' has negative '$Name': $number"
    }
    return $number
}

function Save-Crop([object]$Entry) {
    $entryId = [string]$Entry.id
    $sourcePath = Resolve-ProjectPath $Entry.source
    $outputPath = Get-DefaultOutput $Entry
    $crop = $Entry.crop
    if ($null -eq $crop) {
        throw "Entry '$entryId' is missing crop."
    }

    $x = Get-Number $crop "x" $entryId
    $y = Get-Number $crop "y" $entryId
    $width = Get-Number $crop "width" $entryId
    $height = Get-Number $crop "height" $entryId
    if ($width -le 0 -or $height -le 0) {
        throw "Entry '$entryId' crop width/height must be greater than 0."
    }

    $resize = $Entry.resize
    $targetWidth = if ($null -ne $resize) { [int](Get-Number $resize "width" $entryId) } else { [int][Math]::Round($width) }
    $targetHeight = if ($null -ne $resize) { [int](Get-Number $resize "height" $entryId) } else { [int][Math]::Round($height) }
    if ($targetWidth -le 0 -or $targetHeight -le 0) {
        throw "Entry '$entryId' resize width/height must be greater than 0."
    }

    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "Entry '$entryId' source file not found: $sourcePath"
    }
    if ($NoOverwrite -and (Test-Path -LiteralPath $outputPath)) {
        throw "Entry '$entryId' output exists and -NoOverwrite was set: $outputPath"
    }

    $bitmap = $null
    $cropped = $null
    $graphics = $null
    try {
        $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
        if ($x + $width -gt $bitmap.Width + 0.01 -or $y + $height -gt $bitmap.Height + 0.01) {
            throw "Entry '$entryId' crop exceeds source bounds. Source is $($bitmap.Width)x$($bitmap.Height), crop is x=$x y=$y width=$width height=$height."
        }
        if ($DryRun) {
            if (-not $Quiet) {
                Write-Host "[dry-run] $entryId -> $outputPath ($x,$y,$width,$height => ${targetWidth}x${targetHeight}; source $($bitmap.Width)x$($bitmap.Height))"
            }
            return
        }

        $sourceRect = [System.Drawing.RectangleF]::new([float]$x, [float]$y, [float]$width, [float]$height)
        $destRect = [System.Drawing.RectangleF]::new(0, 0, [float]$targetWidth, [float]$targetHeight)
        $cropped = [System.Drawing.Bitmap]::new($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($cropped)
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.DrawImage($bitmap, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)

        $outputDirectory = Split-Path -Parent $outputPath
        if (-not (Test-Path -LiteralPath $outputDirectory)) {
            New-Item -ItemType Directory -Path $outputDirectory | Out-Null
        }
        Save-CroppedBitmap $cropped $outputPath
        if (-not $Quiet) {
            Write-Host "[ok] $entryId -> $outputPath"
        }
    } finally {
        if ($graphics) { $graphics.Dispose() }
        if ($cropped) { $cropped.Dispose() }
        if ($bitmap) { $bitmap.Dispose() }
    }
}

$manifestPath = Resolve-ProjectPath $Manifest
if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Manifest not found: $manifestPath"
}

$manifestData = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$entries = @($manifestData.entries)
if (-not $entries -or $entries.Count -eq 0) {
    throw "Manifest '$manifestPath' has no entries."
}

$count = 0
foreach ($entry in $entries) {
    Save-Crop $entry
    $count += 1
}

$entryWord = if ($count -eq 1) { "entry" } else { "entries" }
if ($DryRun) {
    Write-Host "Validated $count crop $entryWord."
} else {
    Write-Host "Processed $count crop $entryWord."
}
