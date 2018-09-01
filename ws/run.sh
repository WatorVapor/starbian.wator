#!/bin/bash
find / | grep node_modules >./all.files
export NODE_PATH=/usr/local/lib/node_modules:/usr/src/app/node_modules:$NODE_PATH
node ./app.js
