rmdir /S /Q staging coverage dist
call npx vue-cli-service build
call tsc --build tsconfig-electron.json
npx electron staging\main.js
