#!/usr/bin/env python3
import vk
import imgur_cats
import requests
import json
import shutil
from io import BytesIO
from PIL import Image 

def test():
    #imgur_cats.test()
    

    if 1:

        print('see SECURE_nastyapass')
        session = vk.AuthSession(app_id='',
                                 user_login='',
                                 user_password='',
                                 scope='photos')
        api = vk.API(session, v='5.87')
        
        print(session.access_token)

        r = api.photos.getUploadServer(album_id='257944503', group_id='173831462')
        upload_url = r['upload_url']
        print(upload_url)
    
    

    url = 'https://i.imgur.com/UMJzRnF.jpg'
    r = requests.get(url)
    data = r.content

    img = Image.open(BytesIO(data))

    """
    f = open('my_downloaded_img.jpg', 'wb+')
    f.write(img)
    f.close()

    
    f = open('my_downloaded_img.jpg', 'rb')
    img2 = f
    img3 = BytesIO(img).read()
    print(type(img2))
    print(type(img))
    print(type(img3))
    return
    """

    #f = open('my_downloaded_img.jpg', 'rb')

    files = {
        'photo': img#f.read()
    }

    r = requests.post(upload_url, files=files)
    print(r.text)

    r = json.loads(r.text)

    r = api.photos.save(album_id='257944503', 
                        group_id='173831462', 
                        server=r['server'], 
                        photos_list=r['photos_list'], 
                        hash=r['hash'])

    print(r)


if "__main__" == __name__:
    test()