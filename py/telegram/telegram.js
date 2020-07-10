import requests


class BotHandler:

    def __init__(self, token):
        self.token = token
        self.api_url = "https://api.telegram.org/bot{}/".format(token)
        self.last_update = None

    def get_updates(self, offset=None, timeout=30):
        method = 'getUpdates'
        params = {'timeout': timeout, 'offset': offset}
        response = requests.get(self.api_url + method, params)
        return response.json()['result']

    def send_message(self, chat_id, text):
        params = {'chat_id': chat_id, 'text': text}
        method = 'sendMessage'
        response = requests.post(self.api_url + method, params)
        return response

    def get_last_update(self):
        updates = self.get_updates()
        update = updates[-1 if len(updates) > 0 else 0]
        if self.last_update is not None and self.last_update['update_id'] == update['update_id']:
            return None
        self.last_update = update
        return update


token = ''
bot = BotHandler(token)


def run():
    update = bot.get_last_update()
    if update is not None:
        chat_id = update['message']['chat']['id']
        first_name = update['message']['chat']['first_name'] if 'first_name' in update['message']['chat'] else ''
        last_name = update['message']['chat']['last_name'] if 'last_name' in update['message']['chat'] else ''
        text = 'Привет, %s %s!' % (first_name, last_name)
        bot.send_message(chat_id, text)
