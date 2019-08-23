#!/usr/bin/env python3
import requests
import re
import os


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'
LAST_ID = MODULE_PATH + 'last_id'


def load_last_id():
    try:
        with open(LAST_ID, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return None


def save_last_id(last_id):
    f = open(LAST_ID, 'w+')
    f.write(last_id)
    f.close()


def load_image_ids():
    r = requests.get('https://imgur.com/r/cats/')
    if r.status_code != requests.codes.ok:
        print(f'imgur server sent status {r.status_code}')
        return None

    start_i = r.text.find('<div class="posts sub-gallery br5 first-child">')
    if start_i == -1:
        print('imgur page has no "first-child"-dom')
        return None

    end_i = r.text.find('<div class="clear"></div>', start_i)
    if end_i == -1:
        print('imgur page has no "clear"-dom')
        return None

    img_ids = re.findall(r'<div id="([a-zA-Z0-9]+)" class="post">', r.text[start_i:end_i])
    if len(img_ids) == 0:
        print('imgur page has no any image ids')
        return None

    return img_ids


def filter_new_ones(ids, last_id):
    for i, id in enumerate(ids):
        if last_id == id:
            return ids[:i]
    return ids


def gimme_cat(test = False):
    last_id = load_last_id() if not test else None
    img_ids = load_image_ids()
    new_ids = filter_new_ones(img_ids, last_id)
    if len(new_ids) > 0:
        save_last_id(new_ids[-1])
        return f'https://i.imgur.com/{new_ids[-1]}.jpg'
    return None
