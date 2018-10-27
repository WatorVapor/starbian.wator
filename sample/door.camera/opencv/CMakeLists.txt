cmake_minimum_required(VERSION 2.8)
project(door.camera.face)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=c14 -g -pthread ")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++14 -g -pthread ")

include_directories(./redisclient/src)
add_executable(door.camera.face.app
  main.cpp
)
FIND_PACKAGE( OpenCV REQUIRED )
FIND_PACKAGE( Boost COMPONENTS 
  program_options
  system
  REQUIRED 
)

target_link_libraries(door.camera.face.app
  ${OpenCV_LIBS}
  ${Boost_LIBRARIES}
  pthread
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
