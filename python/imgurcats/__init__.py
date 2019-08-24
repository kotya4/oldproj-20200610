#!/usr/bin/env python3
from simplehtmlparser import SimpleHTMLParser
import requests
import re


def parse_post_node(node):
    # unpacking post id
    # id = [a[1] for a in node.attrs if a[0] == 'id'][0]

    # unpacking img url
    a = [a for a in node.nodes if a.name == 'a'][0]
    img = [i for i in a.nodes if i.name == 'img'][0]
    img_url = [a[1] for a in img.attrs if a[0] == 'src'][0]

    # parse url id (w/o 'b')
    r = re.findall(r'com/[^"]+.jpg', img_url)
    url_id = r[0][4:-5] if r else None

    # unpacking discription
    div = [d for d in node.nodes if d.name == 'div'][0]
    p = [p for p in div.nodes if p.name == 'p'][0]
    data = [d for d in p.nodes if d.name == 'data'][0]
    discr = data.data

    return {
        'id': url_id,
        'discr': discr,
        'img_url': f'https://i.imgur.com/{url_id}.jpg'
    }


def steal_posts():
    r = requests.get('https://imgur.com/r/cats/')
    if r.status_code != requests.codes.ok:
        print(f'imgur server sent status {r.status_code}')
        return None

    # начало контейнера, содержащего загруженные посты
    start_str = '<div class="posts sub-gallery br5 first-child">'
    start_i = r.text.find(start_str)
    if start_i == -1:
        print('imgur page has no "first-child"-dom')
        return None
    start_i += len(start_str)

    # последний элемент контейнера, дальше загруженных постов нет
    end_i = r.text.find('<div class="clear"></div>', start_i)
    if end_i == -1:
        print('imgur page has no "clear"-dom')
        return None

    # парсим выдернутые контейнеры
    parser = SimpleHTMLParser()
    parser.feed(r.text[start_i:end_i])
    nodes = parser.global_node.filter_by(name='div', attr=('class', 'post')).nodes
    return [parse_post_node(node) for node in nodes]


def remove_old_posts(posts, last_id):
    if last_id:
        for i, post in enumerate(posts):
            if last_id == post['id']:
                return posts[:i]
    return posts


def gimme_all_the_cats(last_id = None):
    posts = steal_posts()
    posts = remove_old_posts(posts, last_id)
    return posts


def gimme_cat(last_id = None):
    posts = gimme_all_the_cats(last_id)
    return posts[-1] if posts else None


def download(url):
    r = requests.get(url, stream=True)
    if r.status_code != 200:
        print(f'downloading {url} failed with code {r.status_code}')
        return None
    if r.history:
        print('redirection, cancel posting')
        return None
    return r.raw
