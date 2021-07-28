rmdir /S /Q staging coverage dist
call npx vue-cli-service build
tsc --build tsconfig-electron.json
npm run electron-builder
