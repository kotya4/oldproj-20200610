#!/usr/bin/env python3
from PIL import Image
from os import listdir


less = 0
more = 0
same = 0
lnum = 15
mnum = 64
cols = 0
nons = 0
tree = 0
files = listdir('data/')

colormap = ((0, 0, 0, 255), (0, 0, 255, 255), (0, 255, 255, 255), \
            (255, 0, 0, 255), (255, 0, 255, 255), (255, 255, 0, 255), \
            (255, 255, 255, 255), (128, 128, 128, 255), (128, 128, 255, 255), \
            (128, 255, 255, 255), (255, 128, 128, 255), (255, 128, 255, 255))

for i, file in enumerate(files):
    if i % 5000 == 0:
        print(str(i + 1) + ' of ' + str(len(files)))
    img = Image.open('data/' + file)
    w, h = img.size
    if w < lnum or h < lnum:
        less += 1
    elif w > mnum or h > mnum:
        more += 1
    elif min(w / h, h / w) < 0.5:
        nons += 1
    else:
        same += 1

        colors = img.getcolors()
        if len(colors) < 3:
            tree += 1
            continue

        #img = img.convert('RGBA')
        #pixdata = img.load()
        #for y in range(img.size[1]):
        #    for x in range(img.size[0]):
        #        if pixdata[x, y][3] != 0:
        #            for ci, c in enumerate(colors):
        #                if c[1] == pixdata[x, y]:
        #                    pixdata[x, y] = colormap[ci]
        #                    break;

        new_img = Image.new(img.mode, (mnum, mnum))
        x = int((mnum - w) / 2)
        y = int((mnum - h) / 2)
        new_img.paste(img, (x, y, x + w, y + h))
        new_img.save('resized/' + file, 'png')

        c = len(colors)
        if cols < c:
            cols = c
print('==========================')
print('less than ' + str(lnum) + ' x ' + str(lnum) + ': ' + str(less))
print('more than ' + str(mnum) + ' x ' + str(mnum) + ': ' + str(more))
print('bad aspect ratio: ' + str(nons))
print('colors less than 3: ' + str(tree))
print('good data: ' + str(same))
print('max colors num: ' + str(cols))
