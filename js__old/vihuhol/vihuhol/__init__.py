#!/usr/bin/env python3
import os
import json
import vk_api


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'


rules = None
last_id = None

def load_last_id():
    global last_id
    if last_id == None:
        with open(MODULE_PATH + 'last_id', 'r') as f:
            last_id = int(f.read())


def save_last_id():
    global last_id
    f = open(MODULE_PATH + 'last_id', 'w+')
    f.write(str(last_id))
    f.close()


def open_rules():
    global rules
    if rules == None:
        with open(MODULE_PATH + 'rules.json', 'r') as f:
            rules = json.load(f)


def apply_rules(text):
    global rules
    text = text.lower()
    was_replaced = False
    for rule in rules:
        for key in rule['keys']:
            for i in range(256):
                index = text.find(key)
                if index == -1 \
                or index - 1 >= 0 and text[index - 1].isalpha() \
                or index + len(key) < len(text) and text[index + len(key)].isalpha():
                    break
                else:
                    text = text[:index] + rule['replace_with'] + text[index + len(key):]
                    was_replaced = True
    return { 'was_replaced': was_replaced, 'text': text }


def login():
    global vk
    service_key = ''
    permissions = vk_api.VkUserPermissions.OFFLINE \
                | vk_api.VkUserPermissions.GROUPS \
                | vk_api.VkUserPermissions.STATS \
                | vk_api.VkUserPermissions.WALL
    vk_session = vk_api.VkApi(
        login='',
        password='',
        scope=permissions,
        app_id=0,
        api_version='5.95',
        client_secret=service_key)
    vk_session.auth(token_only=True)
    return vk_session.get_api()


def run():
    global last_id
    load_last_id()
    open_rules()

    vk = login()

    from_id = -33339790
    to_id = -95186485

    r = vk.wall.get(owner_id=from_id, count=10)

    for item in r['items']:
        if item['id'] == last_id:
            break
        if item['marked_as_ads'] != 0:
            continue
        edited = apply_rules(item['text'])
        if edited['was_replaced']:
            response = vk.wall.post(owner_id=to_id, from_group=1, message=edited['text'])
            break

    last_id = r['items'][0]['id']
    save_last_id()


if '__main__' == __name__:
    pass
