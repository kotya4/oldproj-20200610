# cube

Трехмерный вращающийся куб в консоли (win/linux).

+ win:

```sh
g++ cube.cpp -o bin/win/cube.exe && bin\win\cube.exe
```

+ linux:

```sh
g++ cube.cpp -o bin/win/cube.exe && ./bin/win/cube
```

---

```
#define WIREFRAME    // draw wireframe instead of filled shapes?
#define COLORMODE    // draw in color?
#define FRAME_DELAY  // frame delay (can be 0)
#define WIDTH        // screen width
#define HEIGHT       // screen height
```
