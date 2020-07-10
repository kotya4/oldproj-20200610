from tornado import gen
import vk_api
import json
import os
from random import randint


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'
LASTID_PATH = MODULE_PATH + 'last_id.txt'
PASS_PATH   = MODULE_PATH + 'passwords.json'
RULES_PATH  = MODULE_PATH + 'rules.json'


LAST_ERROR = 0 # see set_last_error() and proc_last_error()


def set_last_error(errcode):
    global LAST_ERROR
    LAST_ERROR = errcode


def proc_last_error():
    if   LAST_ERROR == 0: return False
    elif LAST_ERROR == 1: print('ERROR (vihuhol coro) ::: "load_passwords" throws FileNotFoundError')
    elif LAST_ERROR == 2: print('ERROR (vihuhol coro) ::: "load_last_id" throws FileNotFoundError')
    elif LAST_ERROR == 3: print('ERROR (vihuhol coro) ::: "vk_session.auth" throws Exception')
    elif LAST_ERROR == 4: print('ERROR (vihuhol coro) ::: "load_rules" throws FileNotFoundError')
    return True


# Loads vk passwords from file
def load_passwords():
    try:
        with open(PASS_PATH, 'r') as f:
            return json.loads(f.read())
    except FileNotFoundError:
        set_last_error(1)
        return None


# Loads last post id from file
def load_last_id():
    try:
        with open(LASTID_PATH, 'r') as f:
            return int(f.read())
    except FileNotFoundError:
        set_last_error(2)
        return None


# Saves last post id from file
def save_last_id(last_id):
    f = open(LASTID_PATH, 'w+')
    f.write(str(last_id))
    f.close()


# Creates vk session and gets API
def get_vk_api():
    # Loads passwords
    P = load_passwords()
    if not P: return None
    # Initializes vk session
    permissions = vk_api.VkUserPermissions.OFFLINE \
                | vk_api.VkUserPermissions.GROUPS \
                | vk_api.VkUserPermissions.STATS \
                | vk_api.VkUserPermissions.WALL
    vk_session = vk_api.VkApi(
        login=               P['login'],
        scope=              permissions,
        password=         P['password'],
        api_version=             '5.95',
        client_secret= P['service_key'],
        app_id=             P['app_id'],
    )
    # Auths to session
    try:
        vk_session.auth(token_only=True)
    except Exception as e:
        set_last_error(3)
        return None
    # Returns session api
    return vk_session.get_api()


# Loads parsing rules
def load_rules():
    try:
        with open(RULES_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        set_last_error(4)
        return None


# Applies rules
def apply_rules(text, rules):
    text = text.lower()
    was_replaced = False
    how_many = randint(1, 3)
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
                    how_many -= 1
                    if not how_many:
                        return { 'was_replaced': was_replaced, 'text': text }
    return { 'was_replaced': was_replaced, 'text': text }




""" Coroutine definition """



class Coroutine:
    def __init__(self):
        pass


    async def proc(self):
        print("vihuhol proc")
        """ Главная внешняя функция Coroutine, вызывается с помощью IOLoop.current().spawn_callback """
        # Gets vk API
        vk = get_vk_api()
        if proc_last_error(): return False
        # Loads last post id
        last_id = load_last_id()
        if proc_last_error(): return False
        # Loads parsing rules
        rules = load_rules()
        if proc_last_error(): return False
        # group ids
        from_id = -33339790
        to_id =   -95186485
        # Collests posts, applies rules and sends into my group
        r = vk.wall.get(owner_id=from_id, count=20)


        for item in r['items']:
            if item['id'] == last_id:
                print('last_id ' + str(last_id))
                break
            if item['marked_as_ads'] != 0:
                print('marked_as_ads')
                continue
            edited = apply_rules(item['text'], rules)
            print('edited')
            print(edited)
            if edited['was_replaced']:
                #response = vk.wall.post(owner_id=to_id, from_group=1, message=edited['text'])
                print('posted')
                break
        print('end of loop')
        # Saves new post id
        save_last_id(r['items'][0]['id'])
        # Sleep 6 hours before next function call
        await gen.sleep(60 * 60 * 6)
