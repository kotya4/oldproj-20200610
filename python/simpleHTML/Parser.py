#!/usr/bin/env python3
from html.parser import HTMLParser
from .Node import Node


class Parser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.global_node = Node(name='global')
        self.curr = self.global_node

    def handle_starttag(self, tag, attrs):
        node = Node(name=tag, parent=self.curr, attrs=attrs)
        self.curr.nodes.append(node)
        self.curr = node

    def handle_endtag(self, tag):
        if self.curr.name == tag:
            self.curr = self.curr.parent
        # TODO: raise error if tag not match

    def handle_data(self, data):
        self.curr.nodes.append(Node(name='data', parent=self.curr, data=data))
