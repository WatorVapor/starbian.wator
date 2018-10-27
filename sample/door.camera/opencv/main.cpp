#include <string>
#include <iostream>
#include <vector>
using namespace std;

#define DUMP_VAR(x)                                                            \
  {                                                                            \
    std::cout << __func__ << ":" << __LINE__ << "::" << #x << "=<" << x << ">" \
              << std::endl;                                                    \
  }

#include "opencv2/opencv.hpp"

const string cascade_name("/opt/local/share/opencv/haarcascades/haarcascade_frontalface_alt.xml");


int main (int argc, char **argv) {
  
  if( argc < 2){
    DUMP_VAR(argc);
    DUMP_VAR(argv[0]);
    return 0;
  }
  string fileName = string(argv[1]);
  //string fileName = "/tmp/facedetect1.png";
  DUMP_VAR(fileName);
  cv::Mat image = cv::imread(fileName, CV_LOAD_IMAGE_COLOR);
  DUMP_VAR(fileName);
  if(! image.data ) {
    DUMP_VAR(fileName);
    return 0;
  }
  cv::CascadeClassifier cascade;
  DUMP_VAR(cascade.empty());
  cascade.load( cascade_name );
  DUMP_VAR(cascade.empty());

  cv::Mat gray;
  cv::cvtColor( image, gray, cv::COLOR_BGR2GRAY );
  vector<cv::Rect> faces;
  cascade.detectMultiScale( gray, faces );
  DUMP_VAR(faces.size());
  return 0;
}
