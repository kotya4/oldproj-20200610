# [![](http://kotya.tk/favicon.ico)](http://kotya.tk) imgurcats

---

Крадёт ссылки из [/r/cats](https://imgur.com/r/cats/)


```python
import imgurcats
url = imgurcats.gimme_cat()
if url:
  print(f'What a lovely cat {url} :3')
else:
  print('Sorry, no imgur cats for today :(')
```

#requirements:

+ requests
