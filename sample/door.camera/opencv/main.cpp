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

static std::atomic<bool> bDetectIsRunning(false);
static string sDetectImagePath;
static std::mutex mtxImagePath; 
static std::condition_variable cvImagePath;
void RedisEntryClient::onMessageAPI(const std::vector<char> &buf) {
  string msg(buf.begin(),buf.end());
  DUMP_VAR(msg);
  if(bDetectIsRunning) {
    deleteFile(msg);
  } else {
    std::lock_guard<std::mutex> guard(mtxImagePath);
    sDetectImagePath = msg;
    cvImagePath.notify_one();
  }
}


void runDetectFace(const string &fileName) {
  cv::Mat image = cv::imread(fileName, CV_LOAD_IMAGE_COLOR);
  DUMP_VAR(fileName);
  if(! image.data ) {
    DUMP_VAR(fileName);
    return ;
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
  std::cout << faces.size() <<std::endl;
}

void detect_face_main(void) {
  while(true) {
    {
      std::unique_lock<std::mutex> lk(mtxImagePath);
      cvImagePath.wait(lk);
    }
    bDetectIsRunning = true;
    string fileName;
    {
      std::lock_guard<std::mutex> guard(mtxImagePath);
      fileName = sDetectImagePath;
    }
    if(fileName.empty() == false) {
      runDetectFace(sDetectImagePath);
    }
    deleteFile(fileName);
    bDetectIsRunning = false;
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
