#include <string>
#include <iostream>
using namespace std;

#define DUMP_VAR(x)                                                            \
  {                                                                            \
    std::cout << __func__ << ":" << __LINE__ << "::" << #x << "=<" << x << ">" \
              << std::endl;                                                    \
  }

#include "opencv2/opencv.hpp"

const string cascade_name("/opt/local/share/opencv/haarcascades/haarcascade_frontalface_default.xml");

int main (int argc, char **argv) {
  cv::VideoCapture cap(0);
  DUMP_VAR(cap.isOpened());
  return 0;
}
