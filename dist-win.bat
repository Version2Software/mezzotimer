rmdir /S /Q staging dist
call npx vue-cli-service build
copy electron\* staging
call npx electron-builder
