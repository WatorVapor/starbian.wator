#!/bin/bash
echo "start update packages"
npm i --save
npm audit fix
echo "finnish update packages"
