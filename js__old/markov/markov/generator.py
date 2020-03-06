#!/usr/bin/env python3
import json
import random


data = None


def load_from_file(filename):
    global data
    with open(filename, 'r') as f:
        data = json.load(f)
        return True
    return False


def generate(count = 64):
    if data == None:
        raise ValueError('data was not loaded')
    result = ''
    index = random.choice(data['first'])
    for i in range(count):
        if index == None:
            break
        result += data['dictionary'][index] + ' '
        next_index = random.randint(0, data['chain'][index]['amount'] - 1)
        for n in data['chain'][index]['next']:
            next_index -= n[1]
            if next_index <= 0:
                index = n[0]
                break
    return result[:-1]


if __name__ == '__main__':
    print('Help:')
    print('  You can call "load_from_file( [filename] )" to load data from external file.')
    print('  Make sure that function returns True.')
    print('  Then, call "generate([count = 64])" to generate random text with certain number of words.')
