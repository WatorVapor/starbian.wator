#!/bin/bash
mkdir -p /tmp/door_camera
mount -t tmpfs -o size=4M tmpfs /tmp/door_camera
log=/tmp/door.camera.watch_dog.log
cd /home/ma/wator/starbian.wator/sample/door.camera && nodejs watch_dog.js >${log} 2>&1
