#!/usr/bin/env python3
import re
import json


dictionary = []    # list of all words existed in text (no repeat)
indexed_lines = [] # represends lines as list of indices reffered to disctionary


# converts line into tuple
def tuple_of(line):
    # each "useful" line in input have to have a number in front
    sub = ''
    if line[0].isdigit():
        for i, e in enumerate(line):
            if not e.isdigit():
                sub = line[i:]
                break
    #  convertes parsed line into tuple
    if sub:
        # clears line from non-alphabetic symbols ;
        # lowers case ;
        # splits into list ;
        # removes empty strings from list ;
        # finally, returns tuple.
        return tuple(filter(None, re.sub('[^а-яА-ЯёЁ]+', ' ', sub).lower().split(' ')))
    # if line is empty then returns empty tuple
    return tuple()


# allocates memory for chain list (simple "[{ ... }] * capacity" doesn't work)
def alloc_chain(capacity):
    chain = []
    for i in range(capacity):
        chain.append({ 'next': [], 'amount': 0 })
    return chain


print('CREATING DICTIONARY ...')


with open('bible.txt', 'r', encoding='utf8') as f:
    for index, line in enumerate(f):
        # logs process
        if index % 500 == 0:
            print('    %d of ???' % ( index, ))
        # HACK: only first 1000 lines will be proc
        if index == 1000:
            break
        # converts line into indices reffered to disctionary
        # and pushes new words in dictionary if any found.
        indexed = []
        for word in tuple_of(line):
            found = False
            for i, w in enumerate(dictionary):
                # does not update dictionary if word already in there
                if w == word:
                    indexed.append(i)
                    found = True
                    break
            if not found:
                # updates dictionary
                indexed.append(len(dictionary))
                dictionary.append(word)
        # pushes indexed line in list
        if indexed:
            indexed_lines.append(indexed)


chain = alloc_chain(len(dictionary)) # allocates object list for chain
first = []                           # list of first indices in lines


print('CREATING CHAINS ...')


for index, line in enumerate(indexed_lines):
    # logs process
    if index % 500 == 0:
        print('    %d of %d' % ( index, len(indexed_lines), ))
    # pushes first index from indexed line into "first" if index not already exists there
    if not any(line[0] == e for e in first):
        first.append(line[0])
    # updates indices of field "next"
    for i, word in enumerate(line):
        next_word = line[i + 1] if i + 1 < len(line) else None
        found = False
        for e in chain[word]['next']:
            if e[0] == next_word:
                # increments "mention" (second element of chain field "next") if index of
                # "next index" already existed in "next".
                e[1] += 1
                found = True
                break
        # pushes "next_word" with "mention" = 1 if index was not found in "next"
        if not found:
            chain[word]['next'].append([next_word, 1])
        # incs amount of mentions anyway (amount of mentions in element of chain)
        chain[word]['amount'] += 1


j = { 'dictionary': dictionary, 'chain': chain, 'first': first } # creates json with data


print('SAVING TO FILE ...')


with open('output.json', 'w') as f:
    json.dump(j, f)


print('DONE.')
