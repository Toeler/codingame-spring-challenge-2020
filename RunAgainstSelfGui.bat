@ECHO OFF
set "Seed=-4954591743048563016"
set "SourceFile=dist\index.js"
set "LatestSnapshot=dist\index-latest.js"
set "UserInputPath=%LatestSnapshot%"
set /P UserInputPath="Enter Snapshot File:"
set /P Seed="Enter Seed:"

java -jar -Dleague.level=3 ../codingame-spring-challenge-2020-brutaltester/target/spring-2020-1.0-SNAPSHOT-shaded.jar -d timeout=1000!seed=%Seed% -p1 "node %SourceFile%" -p1name "Source" -p2 "node %UserInputPath%" -p2name "Snapshot" -s