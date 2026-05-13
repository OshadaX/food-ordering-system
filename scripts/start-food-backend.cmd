@echo off
set "ROOT=%~dp0.."
set "CATALINA_HOME=%ROOT%\backend\target\cargo\installs\tomcat-10.1.18\apache-tomcat-10.1.18"
set "CATALINA_BASE=%ROOT%\backend\target\cargo\configurations\tomcat10x"
call "%CATALINA_HOME%\bin\catalina.bat" run
