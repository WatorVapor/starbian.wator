#include <string>
#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <atomic>
#include <mutex>
#include <condition_variable>
using namespace std;

#if 1
#define LOG_VAR(x)                                                            \
  {                                                                            \
    std::cout << __func__ << ":" << __LINE__ << "::" << #x << "=<" << x << ">" \
              << std::endl;                                                    \
  }
#else 
#define DUMP_VAR(x) 
#endif
#if 0
#define DUMP_VAR(x)                                                            \
  {                                                                            \
    std::cout << __func__ << ":" << __LINE__ << "::" << #x << "=<" << x << ">" \
              << std::endl;                                                    \
  }
#else 
#define DUMP_VAR(x) 
#endif

#include "opencv2/opencv.hpp"

const string cascade_name("/usr/share/opencv/haarcascades/haarcascade_frontalface_alt2.xml");


#include <boost/asio/ip/address.hpp>
#include <redisclient/redisasyncclient.h>
class RedisEntryClient
{
public:
    RedisEntryClient(boost::asio::io_service &ioService)
        : ioService(ioService)
    {}
    void onMessageAPI(const std::vector<char> &buf);
private:
    boost::asio::io_service &ioService;
};

const string strConstDoorImageChannelName("door.camera.image");
const string strConstDoorFaceChannelName("door.camera.face");


void redis_sub_main(void) {
  for(;;) {
    try{
      boost::asio::io_service ioService;
      boost::asio::ip::tcp::resolver resolver(ioService);
      boost::asio::ip::tcp::resolver::query query("127.0.0.1", "6379");
      boost::asio::ip::tcp::resolver::iterator iter = resolver.resolve(query);
      boost::asio::ip::tcp::endpoint endpoint = iter->endpoint();
      DUMP_VAR(endpoint);
      RedisEntryClient client(ioService);
      redisclient::RedisAsyncClient subscriber(ioService);
      subscriber.connect(endpoint, [&](boost::system::error_code ec){
        if(ec) {
          DUMP_VAR(ec);
        } else {
          DUMP_VAR(ec);
          subscriber.subscribe(strConstDoorImageChannelName,std::bind(&RedisEntryClient::onMessageAPI, &client, std::placeholders::_1));
        }
      });
      ioService.run();
    } catch(std::exception e) {
      DUMP_VAR(e.what());
    }
    std::this_thread::sleep_for(10s);
  }
}


static std::weak_ptr<redisclient::RedisAsyncClient> gPublishRef;

void redis_pub_main(void) {
  for(;;) {
    try {
      boost::asio::io_service ioService;
      boost::asio::ip::tcp::resolver resolver(ioService);
      boost::asio::ip::tcp::resolver::query query("127.0.0.1", "6379");
      boost::asio::ip::tcp::resolver::iterator iter = resolver.resolve(query);
      boost::asio::ip::tcp::endpoint endpoint = iter->endpoint();
      DUMP_VAR(endpoint);
      RedisEntryClient client(ioService);
      auto publish = std::make_shared<redisclient::RedisAsyncClient>(ioService);
      DUMP_VAR(publish);
      gPublishRef = publish;
      publish->connect(endpoint, [&](boost::system::error_code ec) {
        if(ec) {
          DUMP_VAR(ec);
        } else {
          DUMP_VAR(ec);
        }
      });
      DUMP_VAR(publish);
      ioService.run();
    } catch(std::exception e) {
      DUMP_VAR(e.what());
    }
    std::this_thread::sleep_for(10s);
  }
}
void deleteFile(const string &path) {
  string cmd = "rm -rf ";
  cmd += path;
  ::system(cmd.c_str());
}

static vector<string> sDetectImagePath;
static std::mutex mtxImagePath; 
static std::condition_variable cvImagePath;
void RedisEntryClient::onMessageAPI(const std::vector<char> &buf) {
  string msg(buf.begin(),buf.end());
  DUMP_VAR(msg);
  static auto prev = std::chrono::system_clock::now();
  auto now = std::chrono::system_clock::now();
  auto escapedCaptureFrame = std::chrono::duration_cast<std::chrono::milliseconds>(now - prev);
  DUMP_VAR(escapedCaptureFrame.count());
  prev = now;
  std::lock_guard<std::mutex> guard(mtxImagePath);
  sDetectImagePath.push_back(msg);
  cvImagePath.notify_one();  
}

static cv::CascadeClassifier cascade;
static const int iConstFaceArea = 2000;

void runDetectFace(const string &fileName) {
  auto start = std::chrono::system_clock::now();
  cv::Mat image = cv::imread(fileName, CV_LOAD_IMAGE_COLOR);
  DUMP_VAR(fileName);
  if(! image.data ) {
    DUMP_VAR(fileName);
    return ;
  }

  cv::Mat gray;
  cv::cvtColor( image, gray, cv::COLOR_BGR2GRAY );
  vector<cv::Rect> faces;
  cascade.detectMultiScale( gray, faces );
  DUMP_VAR(faces.size());
  auto sumArea = 0;
  for(auto face:faces) {
    DUMP_VAR(face.area());
    sumArea += face.area();
  }
  // debug only
  for(auto face:faces) {
    cv::Point center( face.x + face.width*0.5, face.y + face.height*0.5 );
    cv::ellipse( image, center, Size( face.width*0.5, face.height*0.5), 0, 0, 360, cv::Scalar( 255, 0, 255 ), 4, 8, 0 );
  }
  if(faces.size() >0 ) {
    vector<int> compression_params;
    compression_params.push_back(cv::IMWRITE_PNG_COMPRESSION);
    compression_params.push_back(9);
    static int detectedFaceOutputCounter = 0;
    try {
      string path = "/tmp/face.detected.output.";
      path += std::to_string(detectedFaceOutputCounter++);
      path += ".png";
      cv::imwrite(path, mat, compression_params);
    }
    catch (cv::Exception& ex) {
      LOG_VAR(ex);
    }
  }
  /// debug
  LOG_VAR(sumArea);
  bool detectedFace = sumArea>iConstFaceArea;
  auto publish = gPublishRef.lock();
  if(publish &&publish->isConnected()) {
    publish->publish(strConstDoorFaceChannelName, std::to_string(detectedFace));
  }
  auto end = std::chrono::system_clock::now();
  auto escaped = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  DUMP_VAR(escaped.count());
}

void detect_face_main(void) {
  DUMP_VAR(cascade.empty());
  cascade.load( cascade_name );
  DUMP_VAR(cascade.empty());
  while(true) {
    string fileName;
    {
      std::lock_guard<std::mutex> guard(mtxImagePath);
      if(!sDetectImagePath.empty()) {
        fileName = sDetectImagePath.front();
        DUMP_VAR(sDetectImagePath.size());
        sDetectImagePath.clear();
      }
    }
    if(fileName.empty()) {
      std::unique_lock<std::mutex> lk(mtxImagePath);
      cvImagePath.wait(lk);
    } else {
      runDetectFace(fileName);
      deleteFile(fileName);
    }
  }
}

int main (int argc, char **argv) {
/*  
  if( argc < 2){
    DUMP_VAR(argc);
    DUMP_VAR(argv[0]);
    return 0;
  }
  string fileName = string(argv[1]);
*/
  string fileName = "/tmp/facedetect1.png";
  DUMP_VAR(fileName);
  
  runDetectFace(fileName);

  thread pub(redis_pub_main);
  thread sub(redis_sub_main);
  thread face(detect_face_main);
  pub.join();
  pub.join();
  face.join();
  
  return 0;
}
