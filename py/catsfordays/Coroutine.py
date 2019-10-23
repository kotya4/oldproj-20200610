#!/usr/bin/env python3
from imgurcats import gimme_cats, download_from_url
from types import SimpleNamespace
from tornado import gen
import vk_api
import json
import os


MODULE_PATH = os.path.dirname(os.path.realpath(__file__)) + '/'


class Coroutine:
    def __init__(self):
        self.album_id = 266504024
        self.group_id = 70608035
        # self.album_id = 257944503
        # self.group_id = 173831462
        self.last_err = { 'code': 0, 'msg': 'no errors' }
        self.last_post_index = -1
        self.last_id = None
        self.posts = []
        self.vk = None


    def passwords(self):
        try:
            with open(MODULE_PATH + 'passwords.json', 'r') as f:
                return json.loads(f.read())
        except FileNotFoundError:
            return None


    def get_api(self):
        pas = self.passwords()
        if not pas:
            self.last_err = { 'code': 1, 'msg': 'passwords not loaded' }
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
        except Exception as e:
            self.last_err = { 'code': 2, 'msg': str(e) }
            return None

        return vk_session.get_api()


    def get_last_id_from_caption(self):
        try:
            response = self.vk.photos.get(
                owner_id=-self.group_id,
                album_id=self.album_id,
                count=1,
                rev=1,
            )
        except Exception as e:
            self.last_err = { 'code': 3, 'msg': str(e) }
            return None

        if not 'items' in response:
            self.last_err = { 'code': 5, 'msg': f'no items responsed: {response}' }
            return None

        return response['items'][0]['text']


    def initialize(self):
        # ФАТАЛЬНАЯ ОШИБКА (см. last_err['msg']).
        self.vk = self.get_api()
        if not self.vk:
            return False

        # ФАТАЛЬНАЯ ОШИБКА (см. last_err['msg']).
        self.last_id = self.get_last_id_from_caption()
        if not self.last_id:
            return False

        # ФАТАЛЬНАЯ ОШИБКА (см. last_err['msg']).
        result = gimme_cats(self.last_id)
        if result['err']['code']:
            self.last_err = result['err']
            self.last_err['code'] += 0x10
            return False

        # Если imgurcats вернул пустой список, будет необходимо через какое-то время
        # вызвать initialize снова.
        self.posts = result['posts']
        if not self.posts:
            return False

        # last_post_index итерируется до тех пор, пока не будет найден последний пост.
        for self.last_post_index, post in enumerate(self.posts):
            if post['id'] == self.last_id:
                break

        # Возвращаем True (в следующий раз initialize будет пропущен и сразу вызовется make_post).
        return True


    def make_post(self):
        result = {
            'post_id': None,
            'status': 0,
            'msg': 'no errors',
        }

        # Если перед последним запощенным постом нет других постов, возвращаем status 1,
        # initialize вызовется снова через какое-то время.
        if self.last_post_index < 0:
            result['status'] = -1
            return result

        post = self.posts[self.last_post_index]
        url = post['img_url']
        discr = post['discr']
        self.last_id = post['id']
        self.last_post_index -= 1

        download_result = download_from_url(url)
        err = download_result['err']
        raw = download_result['raw']

        # Если при скачивании картинки произошла ошибка (редирект и т.д.), тогда
        # возвращаем код ошибки и сообщение, make_post будет вызван еще раз.
        if err['code'] or not raw:
            result['status'] = err['code']
            result['msg'] = err['msg']
            return result

        try:
            photo = vk_api.VkUpload(self.vk).photo(
                photos=raw,
                album_id=self.album_id,
                group_id=self.group_id,
                caption=self.last_id,
            )

            response = self.vk.wall.post(
                message=discr,
                owner_id=-self.group_id,
                from_group=1,
                attachments=f'photo-{self.group_id}_{photo[0]["id"]}',
            )
        except Exception as e:
            # ФАТАЛЬНАЯ ОШИБКА (см. last_err['msg']).
            result['status'] = 666666
            self.last_err = 6
            self.last_err['msg'] = result['msg'] = str(e)
            return result

        # Если vk вернул response без ключа post_id, значит произошла
        # ошибка на сервере, initialize будет вызван еще раз.
        if not 'post_id' in response:
            result['status'] = -2
            result['msg'] = f'no post_id responsed: {response}'
            return result

        # Все хорошо, в следующий раз снова будет вызван make_post.
        result['post_id'] = response['post_id']
        return result


    async def proc(self):
        """ Главная внешняя функция Coroutine, вызывается с помощью IOLoop.current().spawn_callback """
        # TODO: возможно, стоит создать суперкласс Coroutine и наследовать виртуальную функцию proc оттуда?
        initialized = False
        while True:
            if not initialized:
                initialized = self.initialize()
                print(f'::: catsfordays COROUTINE ::: reinit, {len(self.posts)} post(s) loaded')

            if initialized:
                post_result = self.make_post()
                # Требуется повторный вызов initialize.
                if post_result['status'] < 0:
                    initialized = False
                # Выводим текст ошибки на экран (на всякий случай).
                if post_result['status'] > 0:
                    msg = post_result['msg']
                    code = post_result['status']
                    print('::: catsfordays COROUTINE WARNING :::')
                    print(f'WARNING CODE: {code}')
                    print(f'WARNING MESSAGE: {msg}')

            # Обнаружена ФАТАЛЬНАЯ ОШИБКА.
            if self.last_err['code']:
                msg = self.last_err['msg']
                code = self.last_err['code']
                print('$$$$$$$$$$ ::: catsfordays COROUTINE ERROR ::: $$$$$$$$$$$$')
                print(f'ERROR CODE: {code}')
                print(f'ERROR MESSAGE: {msg}')
                return

            print(f'::: catsfordays COROUTINE ::: post_id: {post_result["post_id"]}, {self.last_post_index + 1} upcoming')

            # Ждать 3 часа перед следующим постом
            await gen.sleep(60 * 60 * 3)
