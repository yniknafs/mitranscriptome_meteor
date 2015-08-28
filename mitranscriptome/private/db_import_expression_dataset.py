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
SSEA_COLLECTION = 'SSEA'

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

def run_mongoimport(args, parse_func, filename, coll, tmp_json='tmp.json'):
    with open(tmp_json, 'w') as f:
        for json_str in parse_func(filename, args.sep):
            print >>f, json_str
    subprocess.call([args.mongoimport,
                     '-h', args.host,
                     '-d', args.db,
                     '-c', coll,
                     '--file', tmp_json,
                     '--drop',
                     '--type', 'json'])

if __name__ == '__main__':
    parser = argparse.ArgumentParser();
    parser.add_argument('--mongoimport', default='mongoimport')
    parser.add_argument('--host')
    parser.add_argument('--db')
    parser.add_argument('-t', '--transcripts', dest='transcripts_file', default=None)
    parser.add_argument('-s', '--samples', dest='samples_file', default=None)
    parser.add_argument('-e', '--expr', dest='expr_file', default=None)
    parser.add_argument('--ssea', dest='ssea_file', default=None)
    parser.add_argument('--sep', default='\t')
    args = parser.parse_args()

    # import transcripts file
    if args.transcripts_file is not None:
        run_mongoimport(args, parse_tabular, args.transcripts_file,
                        TRANSCRIPTS_COLLECTION, 'transcripts.tmp.json')
    # import samples file
    if args.samples_file is not None:
        run_mongoimport(args, parse_tabular, args.samples_file,
                        SAMPLES_COLLECTION, 'samples.tmp.json')
    # import expression matrix
    if args.expr_file is not None:
        run_mongoimport(args, parse_matrix, args.expr_file,
                        EXPRESSION_COLLECTION, 'expr.tmp.json')
    # import ssea results
    if args.ssea_file is not None:
        run_mongoimport(args, parse_tabular, args.ssea_file,
                        SSEA_COLLECTION, 'ssea.tmp.json')
