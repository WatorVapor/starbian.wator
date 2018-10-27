#!/bin/bash
log=/tmp/door.camera.sound.log
cd /home/ma/wator/starbian.wator/sample/door.camera && nodejs playsound.js >${log} 2>&1
