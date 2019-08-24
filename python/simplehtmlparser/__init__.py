#!/usr/bin/env python3
from html.parser import HTMLParser


class SimpleNode:
    def __init__(self, name, parent = None, attrs = None, data = None):
        self.name = name
        self.data = data
        self.attrs = attrs
        self.parent = parent
        self.nodes = []

    def to_dict(self):
        """ Recoursively removes 'parent' key from nodes to prevent circular references appear """
        r = { 'name': self.name }
        if self.data: r['data'] = self.data
        if self.attrs: r['attrs'] = self.attrs
        if len(self.nodes) > 0: r['nodes'] = [node.to_dict() for node in self.nodes]
        return r

    def filter_by(self, name=None, attr=None):
        """ Returns pointers of all accurances as subnodes of pseudo-node """
        pseudo = self.__class__(name='pseudo')
        for node in self.nodes:
            if name and node.name != name:
                continue
            if attr:
                found = False
                for node_attr in node.attrs:
                    if tuple(node_attr) == tuple(attr):
                        found = True
                        break
                if not found:
                    continue
            pseudo.nodes.append(node)
        return pseudo


class SimpleHTMLParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.global_node = SimpleNode(name='global')
        self.curr = self.global_node

    def handle_starttag(self, tag, attrs):
        node = SimpleNode(name=tag, parent=self.curr, attrs=attrs)
        self.curr.nodes.append(node)
        self.curr = node

    def handle_endtag(self, tag):
        if self.curr.name == tag:
            self.curr = self.curr.parent
        # TODO: raise error if tag not match

    def handle_data(self, data):
        self.curr.nodes.append(SimpleNode(name='data', parent=self.curr, data=data))
