#!/bin/bash
./install_update.sh
export NODE_PATH=/usr/local/lib/node_modules:/usr/src/app/node_modules:$NODE_PATH
#node --expose-gc ./starbianWSApp.js || true
node ./starbianWSApp.js || true
