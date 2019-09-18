#!/usr/bin/env python3
import simpleHTML.Parser
import requests
import re


def parse_node(node):
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


def parse_page():
    result = {
        'err': { 'code': 0, 'msg': 'no errors' },
        'posts': [],
    }

    r = requests.get('https://imgur.com/r/cats/')
    if r.status_code != requests.codes.ok:
        result['err'] = { 'code': 1, 'msg': f'imgur server sent status {r.status_code}' }
        return result

    # начало контейнера, содержащего загруженные посты
    start_str = '<div class="posts sub-gallery br5 first-child">'
    start_i = r.text.find(start_str)
    if start_i == -1:
        result['err'] = { 'code': 2, 'msg': 'imgur page has no "first-child"-dom' }
        return result
    start_i += len(start_str)

    # последний элемент контейнера, дальше загруженных постов нет
    end_i = r.text.find('<div class="clear"></div>', start_i)
    if end_i == -1:
        result['err'] = { 'code': 3, 'msg': 'imgur page has no "clear"-dom' }
        return result

    # парсим выдернутые контейнеры
    parser = simpleHTML.Parser()
    parser.feed(r.text[start_i:end_i])
    nodes = parser.global_node.filter_by(name='div', attr=('class', 'post')).nodes
    result['posts'] = [parse_node(node) for node in nodes]
    return result


def remove_old_posts(posts, last_id):
    if last_id:
        for i, post in enumerate(posts):
            if last_id == post['id']:
                return posts[:i]
    return posts


def gimme_cats(last_id = None):
    result = parse_page()
    result['posts'] = remove_old_posts(result['posts'], last_id)
    return result


def download_from_url(url):
    result = {
        'err': { 'code': 0, 'msg': 'no errors' },
        'raw': None,
    }
    r = requests.get(url, stream=True)
    if r.status_code != 200:
        result['err'] = { 'code': r.status_code, 'msg': 'downloading {url} failed with code {r.status_code}' }
        return result
    result['raw'] = r.raw
    if r.history:
        result['err'] = { 'code': 302, 'msg': 'redirection' }
    return result
