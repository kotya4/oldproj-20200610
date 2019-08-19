#include <cmath>  // tan, sin, cos, abs
#include <cstdio> // printf

#ifdef _WIN32

  #include <windows.h> // system("cls"), Sleep

#endif

#ifdef linux

  #include <unistd.h> // usleep

#endif

// system

void sys__wait(int msec) {
  #ifdef _WIN32

    Sleep(msec);

  #endif

  #ifdef linux

    usleep(msec * 1000);

  #endif
}

void sys__cls() {
  #ifdef _WIN32

    system("cls");

  #endif

  #ifdef linux

    system("clear");

  #endif
}


// screen

const int WIDTH = 80;
const int HEIGHT = 50;
const double PIXEL_RATIO = 1.5;
char BUFFER[HEIGHT][WIDTH];

void buffer__clear() {
  for (int y = 0; y < HEIGHT; ++y) {
    for (int x = 0; x < WIDTH - 1; ++x) BUFFER[y][x] = ' ';
    BUFFER[y][WIDTH - 1] = '\n';
  }
}

void buffer__flush() {
  sys__cls();
  printf("%s", *BUFFER);
}

void buffer__set_pixel(int x, int y, char pixel) {
  if (x < 0 || x >= WIDTH - 1 || y < 0 || y >= HEIGHT) return;
  BUFFER[y][x] = pixel;
}

/*
 * Bresenham line algorithm
 * uses: set_pixel
 */
void buffer__stroke(int x0, int y0, int x1, int y1, char pixel = 254) {
  int dx = abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  int dy = abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  int err = (dx > dy ? dx : -dy) >> 1;
  int e2;

  for (int INF = 0xff; --INF; ) {
    buffer__set_pixel(x0, y0, pixel);
    if (x0 == x1 && y0 == y1) break;
    e2 = err;
    if (e2 >= -dx) { err -= dy; x0 += sx; }
    if (e2 <   dy) { err += dx; y0 += sy; }
  }
}

// matrices, vectors

typedef double mat4 [0x10];
typedef double vec3 [0x03];
typedef double vec2 [0x02];

void mat4__identity(mat4 &out) {
  for(int i = 0; i < 0x10; ++i) out[i] = 0;
  out[0 + (0 << 2)] = 1;
  out[1 + (1 << 2)] = 1;
  out[2 + (2 << 2)] = 1;
  out[3 + (3 << 2)] = 1;
}

void mat4__perspective(mat4 &out, double fov, double ratio, double znear, double zfar) {
  const double m11 = 1.0 / tan((double)fov / 2.0);
  const double m00 = ratio * m11;
  const double m22 = -zfar / (zfar - znear);
  const double m32 = m22 * znear;
  for(int i = 0; i < 0x10; ++i) out[i] = 0;
  out[0 + (0 << 2)] = m00;
  out[1 + (1 << 2)] = m11;
  out[2 + (2 << 2)] = m22;
  out[2 + (3 << 2)] = m32;
  out[3 + (2 << 2)] = -1;
}

void mat4__copy(mat4 &out, const mat4 &a) {
  for(int i = 0; i < 16; ++i) out[i] = a[i];
}

void mat4__dot_mat4_mat4(mat4 &out, const mat4 &a, const mat4 &b) {
  for(int y = 0; y < 4; ++y) for(int x = 0; x < 4; ++x) {
    out[x + (y << 2)] = 0;
    for(int k = 0; k < 4; ++k) out[x + (y << 2)] += a[k + (y << 2)] * b[x + (k << 2)];
  }
}

/*
 * uses: mat4__copy, mat4__dot_mat4_mat4
 */
void mat4__translate(mat4 &out, const mat4 &a, double x, double y, double z) {
  mat4 t = {
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  };
  mat4 m;
  mat4__copy(m, a);
  mat4__dot_mat4_mat4(out, t, m);
}

/*
 * uses: mat4__copy, mat4__dot_mat4_mat4
 */
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
  mat4__dot_mat4_mat4(out, t, m);
}

/*
 * uses: mat4__copy, mat4__dot_mat4_mat4
 */
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
  mat4__dot_mat4_mat4(out, t, m);
}

/*
 * uses: mat4__copy, mat4__dot_mat4_mat4
 */
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
  mat4__dot_mat4_mat4(out, t, m);
}

void vec3__transform_mat4(vec3 &out, const vec3 &a, const mat4 &m) {
  double w = m[3] * a[0] + m[7] * a[1] + m[11] * a[2] + m[15];
  if (!w) w = 1.0;
  out[0] = (m[0] * a[0] + m[4] * a[1] + m[ 8] * a[2] + m[12]) / w;
  out[1] = (m[1] * a[0] + m[5] * a[1] + m[ 9] * a[2] + m[13]) / w;
  out[2] = (m[2] * a[0] + m[6] * a[1] + m[10] * a[2] + m[14]) / w;
}

/*
 * uses: vec3__transform_mat4
 */
void vec2__projection(vec2 &out, const vec3 &pos3, const mat4 &vmat, const mat4 &pmat, int w, int h) {
  vec3 tpos;
  vec3__transform_mat4(tpos, pos3, vmat);
  vec3__transform_mat4(tpos, tpos, pmat);
  out[0] = ((tpos[2] ? tpos[0] / tpos[2] : 0) + 1.0) * (w >> 1);
  out[1] = ((tpos[2] ? tpos[1] / tpos[2] : 0) + 1.0) * (h >> 1);
}

// main

int main() {
  const double fov = M_PI / 4;

  mat4 projection;
  mat4__perspective(projection, fov, (double)WIDTH / HEIGHT / PIXEL_RATIO, 0.1, 100.0);
  mat4__translate(projection, projection, -0.5, -0.5, -5.0);

  mat4 modelview;
  mat4__identity(modelview);

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

  for (int frame = 0; ; ++frame) {
    vec2 pos[vertices_number];
    for (int i = 0; i < vertices_number; ++i)
      vec2__projection(pos[i], vertices[i], modelview, projection, WIDTH, HEIGHT);

    buffer__clear();
    for (int i = 0; i < 4 - 1; ++i) buffer__stroke(pos[i][0], pos[i][1], pos[i + 1][0], pos[i + 1][1]);
    buffer__stroke(pos[3][0], pos[3][1], pos[0][0], pos[0][1]);
    for (int i = 4; i < 8 - 1; ++i) buffer__stroke(pos[i][0], pos[i][1], pos[i + 1][0], pos[i + 1][1]);
    buffer__stroke(pos[7][0], pos[7][1], pos[4][0], pos[4][1]);
    for (int i = 0; i < 4 - 1; ++i) buffer__stroke(pos[i][0], pos[i][1], pos[i + 4][0], pos[i + 4][1]);
    buffer__stroke(pos[7][0], pos[7][1], pos[3][0], pos[3][1]);
    buffer__flush();

    printf("frame : %d\n", frame);
    printf("fov   : %d%c\n", (int)(fov * 180 / M_PI), 248);
    printf("screen: %dx%d\n", WIDTH, HEIGHT);

    mat4__translate(modelview, modelview, +0.5, +0.5, +0.5);
    mat4__rotate_x(modelview, modelview, +0.100);
    mat4__rotate_y(modelview, modelview, -0.050);
    mat4__rotate_z(modelview, modelview, +0.150);
    mat4__translate(modelview, modelview, -0.5, -0.5, -0.5);

    sys__wait(100);
  }
}
