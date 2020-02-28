#!/usr/bin/env python3
import requests
import re
import os


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'
LAST_ID_FILENAME = MODULE_PATH + 'imgur-cats-last-id'


def load_last_id():
    last_id = None
    with open(LAST_ID_FILENAME, 'r') as f:
        last_id = f.read()
    f.close()
    return last_id


def save_last_id(last_id):
    f = open(LAST_ID_FILENAME, 'w+')
    f.write(last_id)
    f.close()


def load_image_ids():
    r = requests.get('https://imgur.com/r/cats/')
    
    if r.status_code != requests.codes.ok:
        print('imgur server sent status {}'.format(r.status_code))
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


def get_new_ones_from(ids, last_id):
    for i, id in enumerate(ids):
        if last_id == id:
            return ids[:i]
    return ids

    
def make_urls_from(ids):
    return ['https://i.imgur.com/{}.jpg'.format(id) for id in ids]


def pet():
    last_id = load_last_id()
    img_ids = load_image_ids()
    new_ids = get_new_ones_from(img_ids, last_id=last_id);
    if len(new_ids) > 0:
        save_last_id(new_ids[0])
        urls = make_urls_from(new_ids)
        return urls
    return []


def test():
    urls = pet()
    if len(urls) > 0:
        for url in urls:
            print(url)
    else:
        print('Sorry, no imgur cats for you today.')


if '__main__' == __name__:
    test()