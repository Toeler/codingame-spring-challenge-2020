@ECHO OFF
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "Timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set "SourceFile=.\dist\index.js"
set "OutputFolder=.\dist"
set "UserInputPath="
set /P UserInputPath="Enter version name:"
set "Filename=index-%Timestamp%"
IF NOT [%UserInputPath%] == [] set "Filename=%Filename%-%UserInputPath%"
copy /y "%SourceFile%" "%OutputFolder%\%Filename%.js" > NUL
copy /y "%SourceFile%" "%OutputFolder%\index-latest.js" > NUL
echo Created "%OutputFolder%\index-%Filename%.js"