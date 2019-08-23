#!/usr/bin/env python3
import imgurcats
import requests
import shutil
import vk_api
import json
import re
import os


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'


def passwords():
    try:
        with open(MODULE_PATH + 'passwords.json', 'r') as f:
            return json.loads(f.read())
    except FileNotFoundError:
        return None


def login():
    pas = passwords()
    if not pas:
        print('passwords not loaded')
        return None
    permissions = vk_api.VkUserPermissions.OFFLINE \
                | vk_api.VkUserPermissions.PHOTOS \
                | vk_api.VkUserPermissions.WALL
    vk_session = vk_api.VkApi(
        login=pas['login'],
        scope=permissions,
        app_id=pas['app_id'],
        password=pas['password'],
        api_version='5.95',
        client_secret=pas['service_key'])
    try:
        vk_session.auth(token_only=True)
    except vk_api.AuthError as error_msg:
        print(error_msg)
        return None
    return vk_session.get_api()


def post_photo(vk, url):
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(MODULE_PATH + 'buffer.jpg', 'wb') as f:
            r.raw.decode_content = True
            shutil.copyfileobj(r.raw, f)
            photo = vk_api.VkUpload(vk).photo(
                MODULE_PATH + 'buffer.jpg',
                album_id=257944503,
                group_id=173831462
            )
            img = f'photo-173831462_{photo[0]["id"]}'
            response = vk.wall.post(owner_id=-173831462, from_group=1, attachments=img)
            return response
    return None


def post():
    url = imgurcats.gimme_cat()
    if url:
        vk = login()
        if vk:
            return post_photo(vk, url)
    return None


def test():
    url = imgurcats.gimme_cat(test=True)
    print(f'url: {url}')
    if url:
        vk = login()
        print(f'vk: {vk}')
        if vk:
            r = post_photo(vk, url)
            print(f'response: {r}')
            return r
    return None
