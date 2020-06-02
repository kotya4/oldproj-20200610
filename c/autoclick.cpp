#define WINVER 0x0500

#include <windows.h>
#include <cstdio>

int main() {
  INPUT ip;
  ip.type = INPUT_KEYBOARD;
  ip.ki.wScan = 0; // hardware scan code for key
  ip.ki.time = 0;
  ip.ki.dwExtraInfo = 0;

  printf("Click 1 to activate autoclicker and 2 to disable.\n");

  int active = 0;

  while (1) {
    if (GetAsyncKeyState(0x31)) {
      if (!active) printf("Enabled.\n");
      active = 1;
    }

    if (GetAsyncKeyState(0x32)) {
      if (active) printf("Disabled.\n");
      active = 0;
    }

    if (active) {
      // Press the "A" key
      // ip.ki.wVk = 0x41; // virtual-key code for the "a" key
      ip.ki.wVk = VK_RSHIFT;
      ip.ki.dwFlags = 0; // 0 for key press
      SendInput(1, &ip, sizeof(INPUT));

      Sleep(50);

      // Release the "A" key
      ip.ki.dwFlags = KEYEVENTF_KEYUP; // KEYEVENTF_KEYUP for key release
      SendInput(1, &ip, sizeof(INPUT));
    }

    Sleep(10);
  }
}
