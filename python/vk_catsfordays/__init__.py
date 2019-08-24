#!/usr/bin/env python3
import imgurcats
import vk_api
import json
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

    permissions = vk_api.VkUserPermissions.MESSAGES \
                | vk_api.VkUserPermissions.OFFLINE \
                | vk_api.VkUserPermissions.PHOTOS \
                | vk_api.VkUserPermissions.WALL

    vk_session = vk_api.VkApi(
        login=pas['login'],
        scope=permissions,
        password=pas['password'],
        api_version='5.95',
        client_secret=pas['service_key'],
        app_id=pas['app_id'],
    )

    try:
        vk_session.auth(token_only=True)
    except vk_api.AuthError as error_msg:
        print(error_msg)
        return None

    return vk_session.get_api()


def post_the_cat(vk, cat):
    url = cat['img_url']
    discr = cat['discr']
    cat_id = cat['id']

    raw = imgurcats.download(url)
    if not raw:
        print('image not downloaded')
        return None

    photo = vk_api.VkUpload(vk).photo(
        photos=raw,
        album_id=257944503,
        group_id=173831462,
        caption=cat_id,
    )

    response = vk.wall.post(
        message=discr,
        owner_id=-173831462,
        from_group=1,
        attachments=f'photo-173831462_{photo[0]["id"]}',
    )
    if not 'post_id' in response:
        print('no post_id responsed', response)
        return None

    return response['post_id']


def get_last_id_from_photos(vk):
    response = vk.photos.get(
        owner_id=-173831462,
        album_id=257944503,
        rev=1,
        count=1,
    )
    if not 'items' in response:
        print('no items responsed', response)
        return None
    return response['items'][0]['text']


def post():
    vk = login()
    if not vk:
        print('can`t login to vk, what`s wrong?')
        return None

    last_id = get_last_id_from_photos(vk)

    cat = imgurcats.gimme_cat(last_id)
    if not cat:
        print('no cats for today, try later')
        return None

    return post_the_cat(vk, cat)
