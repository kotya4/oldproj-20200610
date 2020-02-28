#!/usr/bin/env python3
import urllib.request
import re


if __name__ == '__main__':
    with open('urls.txt', 'r') as f:
        urls = f.read().split('\n')

    for ui, url in enumerate(urls):
        if ui < len(url) == 0:
            print('skip')
            continue
        print(url + ' (' + str(ui + 1) + ' of ' + str(len(urls)) + ') ->')

        try:
            fp = urllib.request.urlopen('https://retrogamezone.co.uk/' + url)
            sprites = re.findall('SRC="images/sprites/nes/(.*).gif"', fp.read().decode('utf8'))
            fp.close()
        except:
            print('..failure')

        for i, sprite in enumerate(sprites):
            print('..downloading ' + sprite + ' (' + str(i + 1) + ' of ' + str(len(sprites)) + ')')
            try:
                fp = urllib.request.urlopen('https://retrogamezone.co.uk/images/sprites/nes/' + sprite + '.gif')
                with open('downloaded/' + sprite + '.gif', 'wb') as f:
                    f.write(fp.read())
                fp.close()
            except:
                print('....failure')
