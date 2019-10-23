#include <ctime>   // time(NULL)
#include <cmath>   // tan, sin, cos, abs
#include <cstdio>  // printf
#include <cstdlib> // qsort

#ifdef _WIN32
  #include <windows.h> // system("cls"), Sleep
  #include <conio.h>   // _kbhit
#endif

#ifdef linux
  #include <unistd.h> // usleep
#endif


#define PIXEL_RATIO 1.5 // pixel ratio
#define WIREFRAME   0   // draw wireframe instead of filled shapes?
#define COLORMODE   1   // draw in color?
#define FRAME_DELAY 0   // frame delay (can be 0)
#define WIDTH       80  // screen width
#define HEIGHT      50  // screen height


/*
 * sys
 *
 * System functions decorators.
 */

inline int sys__kbhit() {
  #ifdef _WIN32
    return _kbhit();
  #endif

  #ifdef linux

  #endif

  // default
  return 0;
}

inline void sys__gotoxy(int x = 0, int y = 0) {
  #ifdef _WIN32
    SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), (COORD){ x, y });
  #endif

  #ifdef linux

  #endif
}

inline void sys__color(int color = 0x07) {
  #ifdef _WIN32
    SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), color);
  #endif

  #ifdef linux

  #endif
}

inline void sys__wait(int msec) {
  #ifdef _WIN32
    Sleep(msec);
  #endif

  #ifdef linux
    usleep(msec * 1000);
  #endif
}

inline void sys__cls() {
  // call 'sys__cls' only once before render,
  // for per-frame clearing use 'sys_gotoxy(0,0)'
  #ifdef _WIN32
    system("cls");
  #endif

  #ifdef linux

  #endif
}


/*
 * polyi
 *
 * Sorts polygons (polygon indices) by distance.
 */

struct polyi {
  double dist;
  int index;
};

int polyi__compare(const void *a, const void *b) {
  const double l = ((struct polyi *)a)->dist;
  const double r = ((struct polyi *)b)->dist;
  int o = 0;
  if (l < r) o = -1; else if (l > r) o = +1;
  return o;
}

// sorts polygons by minimal vertex distance
void polyi__sort(polyi *out, const double *d, const int (*v)[4], const int len) {
  // find minimal vertex distance for current polygon
  for (int i = 0; i < len; ++i) {
    out[i].index = i;
    out[i].dist = d[v[i][0]];
    for (int k = 1; k < 4; ++k)
      if (d[v[i][k]] < out[i].dist)
        out[i].dist = d[v[i][k]];
  }
  // sort
  qsort(out, len, sizeof(polyi), polyi__compare);
}


/*
 * buffer
 *
 * Screen buffer.
 */

char Buffer[HEIGHT][WIDTH];
char ColorBuffer[HEIGHT][WIDTH];
char CurrentPixel = 254;
char CurrentColor = 0x07;

void buffer__clear() {
  for (int y = 0; y < HEIGHT; ++y) {
    for (int x = 0; x < WIDTH - 1; ++x) {
      Buffer[y][x] = ' ';
      ColorBuffer[y][x] = 0x07;
    }
    Buffer[y][WIDTH - 1] = '\n';
    ColorBuffer[y][WIDTH - 1] = 0x07;
  }
  Buffer[HEIGHT - 1][WIDTH - 1] = 0;
}

void buffer__flush() {
  sys__gotoxy();
  #if COLORMODE
    for (int y = 0; y < HEIGHT; ++y) for (int x = 0; x < WIDTH; ++x) {
      sys__color(ColorBuffer[y][x]);
      printf("%c", Buffer[y][x]);
    }
    printf("\n");
  #else
    printf("%s\n", *Buffer);
  #endif
}

void buffer__pixel(char pixel = 254) {
  CurrentPixel = pixel;
}

void buffer__color(char color = 0x07) {
  CurrentColor = color;
}

void buffer__putpixel(int x, int y) {
  if (x < 0 || x >= WIDTH - 1 || y < 0 || y >= HEIGHT) return;
  Buffer[y][x] = CurrentPixel;
  ColorBuffer[y][x] = CurrentColor;
}

void buffer__bresenham(int x1, int y1, const int x2, const int y2) {
  const int dx = abs(x2 - x1);
  const int dy = abs(y2 - y1);
  const int sx = x1 < x2 ? +1 : -1;
  const int sy = y1 < y2 ? +1 : -1;
  int err = (dx > dy ? dx : -dy) >> 1;
  int e2;
  for (int i = dx + dy + 1; i--; ) {
    buffer__putpixel(x1, y1);
    if (x1 == x2 && y1 == y2) break;
    e2 = err;
    if (e2 >= -dx) { err -= dy; x1 += sx; }
    if (e2 <   dy) { err += dx; y1 += sy; }
  }
}

void buffer__bresenham_4_connected(int x1, int y1, const int x2, const int y2) {
  const int dx = abs(x2 - x1);
  const int dy = abs(y2 - y1);
  const int sx = x1 < x2 ? +1 : -1;
  const int sy = y1 < y2 ? +1 : -1;
  int e = 0;
  for (int i = dx + dy + 1; i--; ) {
    buffer__putpixel(x1, y1);
    const int e1 = e + dy;
    const int e2 = e - dx;
    if (abs(e1) < abs(e2)) {
      x1 += sx; e = e1;
    } else {
      y1 += sy; e = e2;
    }
  }
}

void buffer__stroke(const int (*c)[2], const int *v, const int len) {
  for (int i = 0; i < len - 1; ++i)
    buffer__bresenham(c[v[i]][0], c[v[i]][1], c[v[i + 1]][0], c[v[i + 1]][1]);
  buffer__bresenham(c[v[len - 1]][0], c[v[len - 1]][1], c[v[0]][0], c[v[0]][1]);
}

void buffer__fill_convex(const int (*c)[2], const int *v, const int len) {
  for (int i = 0; i < len - 2; ++i) {
    int x1 = c[v[i]][0];
    int y1 = c[v[i]][1];
    const int x2 = c[v[i + 1]][0];
    const int y2 = c[v[i + 1]][1];
    const int dx = abs(x2 - x1);
    const int dy = abs(y2 - y1);
    const int sx = x1 < x2 ? +1 : -1;
    const int sy = y1 < y2 ? +1 : -1;
    int err = (dx > dy ? dx : -dy) >> 1;
    int e2;
    for (int i = dx + dy + 1; i--; ) {
      buffer__bresenham_4_connected(x1, y1, c[v[len - 1]][0], c[v[len - 1]][1]);
      if (x1 == x2 && y1 == y2) break;
      e2 = err;
      if (e2 >= -dx) { err -= dy; x1 += sx; }
      if (e2 <   dy) { err += dx; y1 += sy; }
    }
  }
}


/*
 * mat4, vec3, vec2i
 *
 * Linear algebra for real.
 */

typedef double mat4  [0x10];
typedef double vec3  [0x03];
typedef int    vec2i [0x02];

void mat4__identity(mat4 &out) {
  for(int i = 0; i < 16; ++i) out[i] = 0;
  out[0 + (0 << 2)] = 1;
  out[1 + (1 << 2)] = 1;
  out[2 + (2 << 2)] = 1;
  out[3 + (3 << 2)] = 1;
}

void mat4__perspective(mat4 &out, double fov, double ratio, double znear, double zfar) {
  const double m11 = 1.0 / tan((double)fov / 2.0);
  const double m00 = ratio * m11;
  const double m22 = zfar / (zfar - znear);
  const double m32 = m22 * -znear;
  for(int i = 0; i < 16; ++i) out[i] = 0;
  out[0 + (0 << 2)] = m00;
  out[1 + (1 << 2)] = m11;
  out[2 + (2 << 2)] = m22;
  out[2 + (3 << 2)] = m32;
  out[3 + (2 << 2)] = 1;
}

void mat4__copy(mat4 &out, const mat4 &a) {
  for(int i = 0; i < 16; ++i) out[i] = a[i];
}

void mat4__dot(mat4 &out, const mat4 &a, const mat4 &b) {
  for(int y = 0; y < 4; ++y) for(int x = 0; x < 4; ++x) {
    out[x + (y << 2)] = 0;
    for(int k = 0; k < 4; ++k)
      out[x + (y << 2)] += a[k + (y << 2)] * b[x + (k << 2)];
  }
}

void mat4__translate(mat4 &out, const mat4 &a, double x, double y, double z) {
  mat4 t = {
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  };
  mat4 m;
  mat4__copy(m, a);
  mat4__dot(out, t, m);
}

void mat4__rotate_x(mat4 &out, const mat4 &a, double angle) {
  const double s = sin(angle);
  const double c = cos(angle);
  mat4 t = {
    1,  0,  0,  0,
    0, +c, +s,  0,
    0, -s, +c,  0,
    0,  0,  0,  1
  };
  mat4 m;
  mat4__copy(m, a);
  mat4__dot(out, t, m);
}

void mat4__rotate_y(mat4 &out, const mat4 &a, double angle) {
  const double s = sin(angle);
  const double c = cos(angle);
  mat4 t = {
   +c,  0, -s,  0,
    0,  1,  0,  0,
   +s,  0, +c,  0,
    0,  0,  0,  1
  };
  mat4 m;
  mat4__copy(m, a);
  mat4__dot(out, t, m);
}

void mat4__rotate_z(mat4 &out, const mat4 &a, double angle) {
  const double s = sin(angle);
  const double c = cos(angle);
  mat4 t = {
   +c, +s,  0,  0,
   -s, +c,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1
  };
  mat4 m;
  mat4__copy(m, a);
  mat4__dot(out, t, m);
}

void vec3__transform_mat4(vec3 &out, const vec3 &a, const mat4 &m) {
  double w = m[3] * a[0] + m[7] * a[1] + m[11] * a[2] + m[15];
  if (!w) w = 1.0;
  out[0] = (m[0] * a[0] + m[4] * a[1] + m[ 8] * a[2] + m[12]) / w;
  out[1] = (m[1] * a[0] + m[5] * a[1] + m[ 9] * a[2] + m[13]) / w;
  out[2] = (m[2] * a[0] + m[6] * a[1] + m[10] * a[2] + m[14]) / w;
}

double vec2i__projection(vec2i &out, const vec3 &pos3, const mat4 &vmat, const mat4 &pmat, int w, int h) {
  vec3 tpos;
  vec3__transform_mat4(tpos, pos3, vmat);
  vec3__transform_mat4(tpos, tpos, pmat);
  out[0] = ((tpos[2] ? tpos[0] / tpos[2] : 0) + 1.0) * (w >> 1);
  out[1] = ((tpos[2] ? tpos[1] / tpos[2] : 0) + 1.0) * (h >> 1);
  return tpos[2]; // returns Z-distance from camera
}


/*
 * main
 *
 * Main.
 */

int main() {
  srand(time(NULL));

  const double fov = M_PI / 4;

  mat4 projection;
  mat4__perspective(projection, fov, (double)WIDTH / HEIGHT / PIXEL_RATIO, 0.1, 10.0);
  mat4__translate(projection, projection, -0.5, -0.5, -5.0);

  mat4 modelview;
  mat4__identity(modelview);
  mat4__translate(modelview, modelview, +0.5, +0.5, +0.5);
  mat4__rotate_x(modelview, modelview, 0.01 * (rand() % 200 - 100));
  mat4__rotate_y(modelview, modelview, 0.01 * (rand() % 200 - 100));
  mat4__rotate_z(modelview, modelview, 0.01 * (rand() % 200 - 100));
  mat4__translate(modelview, modelview, -0.5, -0.5, -0.5);

  const int vertices_number = 8;
  const vec3 vertices[vertices_number] = {
    { 0.0, 0.0, 0.0 },
    { 0.0, 1.0, 0.0 },
    { 1.0, 1.0, 0.0 },
    { 1.0, 0.0, 0.0 },
    { 0.0, 0.0, 1.0 },
    { 0.0, 1.0, 1.0 },
    { 1.0, 1.0, 1.0 },
    { 1.0, 0.0, 1.0 }
  };

  const int indices_number = 6;
  const int indices[indices_number][4] = {
    { 0, 1, 2, 3 },
    { 4, 5, 6, 7 },
    { 0, 1, 5, 4 },
    { 3, 2, 6, 7 },
    { 3, 0, 4, 7 },
    { 2, 1, 5, 6 }
  };

  sys__cls();

  for (int frame = 0; !sys__kbhit(); ++frame) {
    vec2i coords[vertices_number]; // projected display coordinates
    double dists[vertices_number]; // distances
    for (int i = 0; i < vertices_number; ++i)
      dists[i] = vec2i__projection(coords[i], vertices[i], modelview, projection, WIDTH, HEIGHT);

    buffer__clear();
    #if WIREFRAME
      buffer__stroke(coords, indices[0], 4);
      buffer__stroke(coords, indices[1], 4);
      for (int i = 0; i < 4; ++i)
        buffer__bresenham(coords[i][0], coords[i][1], coords[i + 4][0], coords[i + 4][1]);
    #else
      polyi sorted[indices_number];
      polyi__sort(sorted, dists, indices, indices_number);
      for (int i = 0; i < indices_number; ++i) {
        buffer__color(0x01 + sorted[i].index);
        buffer__fill_convex(coords, indices[sorted[i].index], 4);
        //buffer__color();
        //buffer__stroke(coords, indices[sorted[i].index], 4);
      }
    #endif
    buffer__flush();

    printf("frame  : %d       \n", frame);
    printf("fov    : %d%c     \n", (int)(fov * 180 / M_PI), 248);
    printf("screen : %dx%d    \n", WIDTH, HEIGHT);
    printf("PRESS ANY KEY TO EXIT\n");

    mat4__translate(modelview, modelview, +0.5, +0.5, +0.5);
    mat4__rotate_x(modelview, modelview, +0.100);
    mat4__rotate_y(modelview, modelview, -0.075);
    mat4__rotate_z(modelview, modelview, +0.025);
    mat4__translate(modelview, modelview, -0.5, -0.5, -0.5);

    #if FRAME_DELAY
      sys__wait(FRAME_DELAY);
    #endif
  }

  sys__color();
  sys__cls();
  return 0;
}
