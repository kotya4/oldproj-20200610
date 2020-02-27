import os
import json
import requests


# https://developers.trello.com/docs/api-introduction
# https://trello.com/app-key


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'


def passwords():
    try:
        with open(MODULE_PATH + 'passwords.json', 'r') as f:
            return json.loads(f.read())
    except FileNotFoundError:
        return None


passes = passwords()
APIKEY = passes['api_key']
TOKEN = passes['token']
LISTID = passes['list_id']


def get_cards():
    r = requests.get(f'https://api.trello.com/1/lists/{LISTID}/cards?fields=name,desc,shortUrl,dateLastActivity&key={APIKEY}&token={TOKEN}')
    return r.json()


def push_card(name, disc):
    if type(name) is not str or type(disc) is not str: raise TypeError
    r = requests.post('https://api.trello.com/1/cards', data={ 'key': APIKEY, 'token': TOKEN, 'idList': LISTID, 'name': name, 'disc': disc })
    return r.text
