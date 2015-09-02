'''
Command line example:

python db_import_collections.py
  --mongoimport ~/Downloads/mongodb-osx-x86_64-3.0.6/bin/mongoimport
  --host localhost:3001 --db meteor
  -t transcripts.txt -s samples.txt -e expr.txt --ssea ssea.txt -a analysis.txt

'''
import sys
import os
import json
import argparse
import subprocess
import collections
import numpy as np
from operator import itemgetter

TRANSCRIPTS_COLLECTION = 'Transcripts'
GENES_COLLECTION = 'Genes'
ALIASES_COLLECTION = 'Aliases'
SAMPLES_COLLECTION = 'Samples'
EXPRESSION_TRANSCRIPT_COLLECTION = 'ExpressionTranscript'
EXPRESSION_GENE_COLLECTION = 'ExpressionGene'
SSEA_TRANSCRIPT_COLLECTION = 'SSEATranscript'
SSEA_GENE_COLLECTION = 'SSEAGene'
SSEA_GENE_COLLECTION = 'SSEAGene'
ANALYSES_COLLECTION = 'Analyses'

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

def convert_transcript_to_gene_metadata(transcripts_file, sep='\t'):
    f = open(transcripts_file)
    header_fields = f.next().strip().split(sep)
    t_id_idx = header_fields.index('transcript_id')
    g_id_idx = header_fields.index('gene_id')
    chrom_idx = header_fields.index('chrom')
    start_idx = header_fields.index('chrom')
    end_idx = header_fields.index('end')
    strand_idx = header_fields.index('strand')
    gene_dict = collections.OrderedDict()
    for line in f:
        fields = line.strip().split(sep)
        t_id = fields[t_id_idx]
        g_id = fields[g_id_idx]
        if g_id not in gene_dict:
            # new record
            d = { 'gene_id': g_id,
                  'transcript_ids': [],
                  'chrom': fields[chrom_idx],
                  'start': int(fields[start_idx]),
                  'end': int(fields[end_idx]),
                  'strand': fields[strand_idx]
                }
            gene_dict[g_id] = d
        else:
            d = gene_dict[g_id]
        # update record
        d['transcript_ids'].append(t_id)
        d['start'] = min(d['start'], int(fields[start_idx]))
        d['end'] = max(d['end'], int(fields[end_idx]))

    i = 0
    for d in gene_dict.itervalues():
        d['_id'] = i
        d['num_isoforms'] = len(d['transcript_ids'])
        yield json.dumps(d)
        i += 1

def convert_transcript_to_gene_expression(transcripts_file, expression_file, output_file, sep='\t'):
    # build mapping of transcript_id to gene_id
    f = open(transcripts_file)
    header_fields = f.next().strip().split(sep)
    t_id_idx = header_fields.index('transcript_id')
    g_id_idx = header_fields.index('gene_id')
    gene_dict = {}
    for line in f:
        fields = line.strip().split(sep)
        gene_dict[fields[t_id_idx]] = fields[g_id_idx]
    f.close()

    f = open(expression_file)
    header_fields = f.next().strip().split(sep)
    numcols = len(header_fields) - 1
    expr_dict = collections.OrderedDict()
    for line in f:
        fields = line.strip().split(sep)
        g_id = gene_dict[fields[0]]
        if g_id not in expr_dict:
            expr_dict[g_id] = np.zeros(numcols)
        expr_dict[g_id] += np.array(map(float, fields[1:]))
    f.close()

    with open(output_file, 'w') as f:
        header_fields[0] = 'gene_id'
        print >>f, sep.join(header_fields)
        for k,v in expr_dict.iteritems():
            fields = [k]
            fields.extend(map(str, v))
            print >>f, sep.join(fields)

def convert_transcript_to_gene_ssea(ssea_file, sep='\t'):
    # build mapping of transcript_id to gene_id
    f = open(ssea_file)
    header_fields = f.next().strip().split(sep)
    ssea_dict = collections.defaultdict(lambda: collections.defaultdict(lambda: []))
    for line in f:
        fields = line.strip().split(sep)
        analysis_id = fields[header_fields.index('analysis_id')]
        t_id = fields[header_fields.index('transcript_id')]
        g_id = fields[header_fields.index('gene_id')]
        frac = float(fields[header_fields.index('frac')])
        fdr = float(fields[header_fields.index('fdr')])
        ssea_dict[analysis_id][g_id].append((t_id, frac, fdr))
    f.close()

    for analysis_id in ssea_dict.iterkeys():
        for g_id in ssea_dict[analysis_id].iterkeys():
            scores = ssea_dict[analysis_id][g_id]
            scores = sorted(scores, key=itemgetter(1))
            d = {
                'gene_id':g_id,
                'frac': [x[1] for x in scores],
                'fdr': [x[2] for x in scores],
                'transcript_ids': [x[0] for x in scores],
                'analysis_id': analysis_id
            }
            yield json.dumps(d)



def run_mongoimport(args, json_iter, coll, tmp_json='tmp.json'):
    with open(tmp_json, 'w') as f:
        for json_str in json_iter:
            print >>f, json_str
    subprocess.call([args.mongoimport,
                     '-h', args.host,
                     '-d', args.db,
                     '-c', coll,
                     '--file', tmp_json,
                     '--drop',
                     '--type', 'json'])
    if not args.keeptmp:
        os.remove(tmp_json)

if __name__ == '__main__':
    parser = argparse.ArgumentParser();
    parser.add_argument('--mongoimport', default='mongoimport')
    parser.add_argument('--host')
    parser.add_argument('--db')
    parser.add_argument('-t', '--transcripts', dest='transcripts_file', default=None)
    parser.add_argument('-s', '--samples', dest='samples_file', default=None)
    parser.add_argument('-e', '--expr', dest='expr_file', default=None)
    parser.add_argument('--ssea', dest='ssea_file', default=None)
    parser.add_argument('-a', '--analyses', dest='analyses_file', default=None)
    parser.add_argument('--aliases', dest='aliases_file', default=None)
    parser.add_argument('--sep', default='\t')
    parser.add_argument('--keeptmp', action='store_true', default=False)
    args = parser.parse_args()

    # import transcripts file
    if args.transcripts_file:
        run_mongoimport(args, parse_tabular(args.transcripts_file, args.sep),
                        TRANSCRIPTS_COLLECTION, 'transcripts.tmp.json')
        json_iter = convert_transcript_to_gene_metadata(args.transcripts_file, args.sep)
        run_mongoimport(args, json_iter, GENES_COLLECTION, 'genes.tmp.json')

    # import gene/transcript name aliases
    if args.aliases_file:
        run_mongoimport(args, parse_tabular(args.aliases_file, args.sep),
                        ALIASES_COLLECTION, 'aliases.tmp.json')

    # import samples file
    if args.samples_file:
        run_mongoimport(args, parse_tabular(args.samples_file, args.sep),
                        SAMPLES_COLLECTION, 'samples.tmp.json')

    # TODO: check that samples and expression data are in the same order

    # import expression matrix
    if args.expr_file:
        run_mongoimport(args, parse_matrix(args.expr_file, args.sep),
                        EXPRESSION_TRANSCRIPT_COLLECTION, 'expr.transcript.tmp.json')

    # import gene expression matrix
    if args.transcripts_file and args.expr_file:
        convert_transcript_to_gene_expression(args.transcripts_file,
                                              args.expr_file,
                                              'expr.gene.tmp.txt',
                                              sep=args.sep)
        run_mongoimport(args, parse_matrix('expr.gene.tmp.txt', args.sep),
                        EXPRESSION_GENE_COLLECTION, 'expr.gene.tmp.json')
        if not args.keeptmp:
            os.remove('expr.gene.tmp.txt')

    # import ssea trasncript results
    if args.ssea_file:
        run_mongoimport(args, parse_tabular(args.ssea_file, args.sep),
                        SSEA_TRANSCRIPT_COLLECTION, 'ssea.transcript.tmp.json')

        # import ssea gene results
        run_mongoimport(args, convert_transcript_to_gene_ssea(args.ssea_file),
                        SSEA_GENE_COLLECTION, 'ssea.gene.tmp.json')


    # import analysis results
    if args.analyses_file:
        run_mongoimport(args, parse_tabular(args.analyses_file, args.sep),
                        ANALYSES_COLLECTION, 'analyses.tmp.json')
