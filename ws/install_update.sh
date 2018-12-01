#!/bin/bash
echo "start update packages"
npm i --save
npm audit fix
echo "wait 1 hour..."
sleep 3600
