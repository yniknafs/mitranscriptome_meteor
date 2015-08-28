'''
Command line example:

python db_import_expression_dataset.py
  --mongoimport ~/Downloads/mongodb-osx-x86_64-3.0.6/bin/mongoimport
  --host localhost:3001 --db meteor
  -t transcripts.txt -s samples.txt -e expr.txt

'''
import sys
import os
import json
import argparse
import subprocess

TRANSCRIPTS_COLLECTION = 'Transcripts'
SAMPLES_COLLECTION = 'Samples'
EXPRESSION_COLLECTION = 'Expression'

def parse_column(filename, sep='\t', header=True, colnum=0):
    f = open(filename)
    if header:
        f.next()
    for line in f:
        fields = line.strip().split(sep)
        yield fields[colnum]

def parse_tabular(filename, sep='\t'):
    '''
    Turns a tab-delimited text file into JSON for import using mongoimport

    Assumptions:
    1) First line is a 'header' line
    2) The first column is the 'key' column
    3) Subsequent columns contain numeric data
    '''
    f = open(filename)
    header_fields = f.next().strip().split(sep)
    i = 0
    for line in f:
        fields = line.strip().split(sep)
        d = {'_id': i}
        for k,v in zip(header_fields, fields):
            d[k] = v
        yield json.dumps(d)
        i += 1

def parse_matrix(filename, sep='\t'):
    f = open(filename)
    f.next() # skip header
    i = 0
    for line in f:
        fields = line.strip().split(sep)
        d = { '_id': i, 'key': fields[0], 'value': map(float, fields[1:]) }
        yield d
        i += 1

if __name__ == '__main__':
    parser = argparse.ArgumentParser();
    parser.add_argument('--mongoimport', default='mongoimport')
    parser.add_argument('--host')
    parser.add_argument('--db')
    parser.add_argument('-t', '--transcripts', dest='transcript_file')
    parser.add_argument('-s', '--samples', dest='samples_file')
    parser.add_argument('-e', '--expr', dest='expr_file')
    parser.add_argument('--tsep', default='\t')
    parser.add_argument('--ssep', default='\t')
    parser.add_argument('--esep', default='\t')
    args = parser.parse_args()

    # import transcripts file
    tmp_json = 'transcripts.tmp.json'
    with open(tmp_json, 'w') as f:
        for json_str in parse_tabular(args.transcript_file, args.tsep):
            print >>f, json_str
    subprocess.call([args.mongoimport,
                     '-h', args.host,
                     '-d', args.db,
                     '-c', TRANSCRIPTS_COLLECTION,
                     '--file', tmp_json,
                     '--drop',
                     '--type', 'json'])

    # import samples file
    tmp_json = 'samples.tmp.json'
    with open(tmp_json, 'w') as f:
        for json_str in parse_tabular(args.samples_file, args.ssep):
            print >>f, json_str
    subprocess.call([args.mongoimport,
                     '-h', args.host,
                     '-d', args.db,
                     '-c', SAMPLES_COLLECTION,
                     '--file', tmp_json,
                     '--drop',
                     '--type', 'json'])

    # import expression matrix
    tmp_json = 'expr.tmp.json'
    with open(tmp_json, 'w') as f:
        for json_str in parse_matrix(args.expr_file, args.esep):
            print >>f, json_str
    subprocess.call([args.mongoimport,
                     '-h', args.host,
                     '-d', args.db,
                     '-c', EXPRESSION_COLLECTION,
                     '--file', tmp_json,
                     '--drop',
                     '--type', 'json'])
