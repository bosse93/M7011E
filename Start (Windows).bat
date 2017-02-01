mkdir C:\lightControlDB 
start cmd.exe /k mongod --dbpath C:\lightControlDB --port 27800 
start cmd.exe /k node app.js