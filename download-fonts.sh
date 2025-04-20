#!/bin/bash

# Создаем директорию для шрифтов, если она не существует
mkdir -p public/fonts

# Определяем URL-адреса шрифтов
declare -A font_urls=(
    ["Montserrat-Regular"]="https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4KLg.woff2"
    ["Montserrat-Medium"]="https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Hw5aXp-p7K4KLg.woff2"
    ["Montserrat-SemiBold"]="https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aXp-p7K4KLg.woff2"
    ["Montserrat-Bold"]="https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4KLg.woff2"
)

# Загружаем каждый шрифт
for font_name in "${!font_urls[@]}"; do
    url="${font_urls[$font_name]}"
    output_file="public/fonts/${font_name}.woff2"
    
    echo "Загрузка ${font_name}..."
    if curl -L -o "$output_file" "$url"; then
        echo "✓ ${font_name} успешно загружен"
    else
        echo "✗ Ошибка при загрузке ${font_name}"
    fi
done

echo "Загрузка шрифтов завершена" 