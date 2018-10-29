#!/bin/bash
log=/tmp/door.camera.websocket.log
cd /home/ma/wator/starbian.wator/sample/door.camera && nodejs app.js >${log} 2>&1
