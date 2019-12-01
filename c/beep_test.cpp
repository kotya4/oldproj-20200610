#include <unistd.h>
#include <fcntl.h>
#include <linux/kd.h>
#include <sys/ioctl.h>

int main(int argc, char** argv){
  int freq = 2000; // freq in hz
  int len = 1000; // len in ms

  int fd = open("/dev/console", O_WRONLY);
  ioctl(fd, KIOCSOUND, (int)(1193180/freq));
  usleep(1000*len);
  ioctl(fd, KIOCSOUND, 0);
  close(fd);
}