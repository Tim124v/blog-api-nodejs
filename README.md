# My Blog

Это современный блог, созданный с использованием React и TypeScript.

## Доступные скрипты

В директории проекта вы можете запустить:

### `npm start`

Запускает приложение в режиме разработки.\
Откройте [http://localhost:3000](http://localhost:3000) для просмотра в браузере.

### `npm run build`

Собирает приложение для продакшена в папку `build`.

### `npm run deploy`

Деплоит приложение на GitHub Pages.

## Деплой на GitHub Pages

1. Убедитесь, что у вас есть репозиторий на GitHub
2. Установите пакет gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Замените "prizr" в поле "homepage" в package.json на ваше имя пользователя GitHub
4. Выполните команду:
   ```bash
   npm run deploy
   ```

После успешного деплоя ваше приложение будет доступно по адресу: https://prizr.github.io/blog-api-nodejs
