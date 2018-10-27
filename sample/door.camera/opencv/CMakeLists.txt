cmake_minimum_required(VERSION 2.8)
project(door.camera.face)
add_executable(door.camera.face.app
  main.cpp
)
FIND_PACKAGE( OpenCV REQUIRED )

target_link_libraries(door.camera.face.app
  ${OpenCV_LIBS}
)
#  opencv_video
#  opencv_videostab
#  opencv_highgui
#  opencv_objdetect
#  opencv_imgproc
#  opencv_ts
#  opencv_superres
#  opencv_stitching
#  opencv_photo
#  opencv_legacy
