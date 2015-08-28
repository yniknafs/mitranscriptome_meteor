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
i = 0
for line in f:
    fields = line.strip().split(',')
    d = { '_id': i, 'name': fields[0], 'tissue': fields[1] }
    print json.dumps(d)
    i += 1
