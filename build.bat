@echo off

call npm install
node node_modules\grunt-cli\bin\grunt %*
