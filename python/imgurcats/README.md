# imgurcats

---

Крадёт котов из [/r/cats](https://imgur.com/r/cats/)


```python
import imgurcats

cat = imgurcats.gimme_cat()

if cat:
  raw_image = imgurcats.download(cat['img_url'])
  print(f'What a lovely cat :3')
else:
  print('Sorry, no imgur cats for today :(')

```

#requirements:

+ requests
+ (simplehtmlparser)
