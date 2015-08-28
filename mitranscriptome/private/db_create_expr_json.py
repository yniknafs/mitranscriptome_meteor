'''
Turns a tab-delimited text file into JSON for import using mongoimport

Assumptions:
1) First line is a 'header' line
2) The first column is the 'key' column
3) Subsequent columns contain numeric data
'''
import sys
import os
import json

f = open(sys.argv[1])
f.next() # skip header
for line in f:
    fields = line.strip().split('\t')
    d = { 'key': fields[0], 'value': map(float, fields[1:]) }
    print json.dumps(d)
