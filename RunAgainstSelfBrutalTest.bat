@ECHO OFF
set "Seed="
IF NOT [%1] == [] set "Seed=-i %1"
set "SourceFile=dist\index.js"
set "LatestSnapshot=dist\index-latest.js"
set "UserInputPath=%LatestSnapshot%"
set /P UserInputPath="Enter Snapshot File:"
set "NumGames=100"

java -jar ../cg-brutaltester/target/cg-brutaltester-1.0.0-SNAPSHOT-shaded.jar -r "java -jar -Dleague.level=3 ../codingame-spring-challenge-2020-brutaltester/target/spring-2020-1.0-SNAPSHOT-shaded.jar" -p1 "node %SourceFile%" -p2 "node %UserInputPath%" -t 2 -n %NumGames% %Seed% -l "./brutaltester-logs/"
pause