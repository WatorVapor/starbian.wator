#!/bin/bash
find / | grep node_modules >./all.files
export NODE_PATH=/usr/local/lib/node_modules
node ./app.js
