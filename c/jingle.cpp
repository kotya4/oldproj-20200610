/*
 * Jingle Bells written at 3 am by Sluchaynaya Kotya.
 *                                    June 4th, 2019.
 * 'What am I doing with my life?' -- he thought tho.
 */
#include <windows.h>
#include <cstdio>

int main() {
  const int F[] = { 130, 146, 164, 174, 196, 220, 246,
                    261, 293, 329, 349, 392, 440, 493,
                    523, 587, 659, 698, 783, 880, 987 },
            song_acc[] = { 3, 3, 7, 0, 4, 3, 7, 0, 4, 3, 4, 4, 5, 0, 0, 0,
                           3, 5, 4, 0, 3, 3, 3, 5, 5, 4, 6, 5, 8, 0, 2, 0 };
  const char s[] = "B1B1B1.B1B1B1.B1D2G1A1B1...C2C2C2.C2B1B1.B1A1A1B1A1.D2",
             sg[] = "Jingle bells, jingle bells, jingle all the way.\nOh "
                    "what fun it is to ride\nIn a one horse open sleigh. \1";
  int song_start = 0,
      song_iter = 0;
  for (int i = 0; i < sizeof(s); ++i) {
    const int song_end = song_start + song_acc[song_iter++];
    for (int k = song_start; k < song_end; ++k) printf("%c", sg[k]);
    song_start = song_end;
    switch(s[i]) {
    case 'C': Beep(F[0 + 7 * (s[++i] - 48)], 200); break;
    case 'D': Beep(F[1 + 7 * (s[++i] - 48)], 200); break;
    case 'E': Beep(F[2 + 7 * (s[++i] - 48)], 200); break;
    case 'F': Beep(F[3 + 7 * (s[++i] - 48)], 200); break;
    case 'G': Beep(F[4 + 7 * (s[++i] - 48)], 200); break;
    case 'A': Beep(F[5 + 7 * (s[++i] - 48)], 200); break;
    case 'B': Beep(F[6 + 7 * (s[++i] - 48)], 200); break;
    default: Sleep(300); break;
    }
  }
}