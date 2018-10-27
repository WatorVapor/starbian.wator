cmake_minimum_required(VERSION 2.8)
project(door.camera.face)
add_executable(door.camera.face.app
  main.cpp
)
target_link_libraries(door.camera.face.app
  opencv_video
  opencv_videostab
  opencv_highgui
  opencv_objdetect
  opencv_imgproc
)
