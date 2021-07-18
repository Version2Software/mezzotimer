rmdir /S /Q staging coverage dist
call npx vue-cli-service build
copy electron\* staging
npm run electron-builder
