#!/bin/bash

# Создаем директорию для шрифтов, если она не существует
mkdir -p public/fonts

# Массив вариантов шрифта для загрузки
FONTS=(
  "Regular"
  "Medium"
  "SemiBold"
  "Bold"
)

# URL базовой директории Google Fonts для Montserrat
BASE_URL="https://fonts.gstatic.com/s/montserrat/v25"

# Загружаем каждый вариант шрифта
for font in "${FONTS[@]}"
do
  echo "Загрузка Montserrat-${font}..."
  curl -L -o "public/fonts/Montserrat-${font}.woff2" "${BASE_URL}/Montserrat-${font}.woff2"
done

echo "Загрузка шрифтов завершена!" 