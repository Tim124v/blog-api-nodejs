# Create fonts directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "public\fonts"

# Define font URLs
$fontUrls = @{
    "Regular" = "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4KLg.woff2"
    "Medium" = "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Hw5aXp-p7K4KLg.woff2"
    "SemiBold" = "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aXp-p7K4KLg.woff2"
    "Bold" = "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4KLg.woff2"
}

Write-Host "Starting font downloads..."

foreach ($style in $fontUrls.Keys) {
    Write-Host "Downloading Montserrat-$style..."
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile(
            $fontUrls[$style],
            "public\fonts\Montserrat-$style.woff2"
        )
        Write-Host "Successfully downloaded Montserrat-$style"
    }
    catch {
        Write-Host "Error downloading Montserrat-$style"
    }
}

Write-Host "Font downloads completed!" 