# simplehtmlparser

---

Парсит простенькие html страницы с помощью [html.parser.HTMLParser](https://docs.python.org/3/library/html.parser.html)


```python
import simplehtmlparser
from json import dumps

simple_html = """
  <div class="my-class">
    <p>
      Hello, SimpleHTMLParser!
    </p>
  </div>
"""

parser = SimpleHTMLParser()
parser.feed(simple_html)

# global node contains all parsed data
node = parser.global_node

# 'to_dict()' returns serializable dictionary
print(dumps(node.to_dict(), indent=2))

# creates pseudo-node wich nodes contains pointers of matching nodes
pseudo = node.filter_by(name='div', attr=('class', 'my-class'))
# all 'pseudo' nodes contains nodes with 'name' == 'div'
# and 'attrs' containing "tuple('class', 'my-class')"
div = pseudo.nodes[0]

# you can separate filters to get same goal:
div = node.filter_by(name='div').filter_by(attr=('class', 'my-class'))

# to get data from inside <p> you can do this:
p = [p for p in div.nodes if p.name == 'p'][0]
data = [d for d in p.nodes if d.name == 'data'][0]
hello_world = data.data

# or this:
hello_world = div.filter_by(name='p').nodes[0].filter_by(name='data').nodes[0].data

# prints 'Hello, SimpleHTMLParser!'
print(hello_world)

```
