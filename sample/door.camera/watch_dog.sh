#!/bin/bash
mkdir -p /tmp/door_camera
log=/tmp/door.camera.watch_dog.log
cd /home/ma/wator/starbian.wator/sample/door.camera && nodejs watch_dog.js >${log} 2>&1
