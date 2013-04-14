@echo off
@title mongodb daemon starter

if exist db (
   echo "db directory found"
) else (
	echo "make db directory for you"
	md db
)
mongod --dbpath %cd%\db