#!/usr/bin/env python3
from PIL import Image
from os import listdir


files = listdir('downloaded/')
for i, gif in enumerate(files):
    print('converting ' + gif + ' (' + str(i + 1) + ' of ' + str(len(files)) + ')')
    img = Image.open('downloaded/' + gif)
    transparency = img.info['transparency']
    img.save('png/' + gif[:-4] + '.png', 'png', transparency=transparency)
