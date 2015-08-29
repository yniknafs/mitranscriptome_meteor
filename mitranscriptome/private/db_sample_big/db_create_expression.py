'''
python db_create_transcript_tsv.py /Volumes/dx11/mctp/projects/ssea/isoform_count_matrix_v7/rownames.txt /Volumes/dx11/mctp/projects/mitranscriptome/annotation/metadata.transcript.txt > transcripts.big.tsv
'''
import sys
import os
import argparse
import logging

def main():
    # parse command line
    parser = argparse.ArgumentParser()
    parser.add_argument("ordered_rownames")
    parser.add_argument("ordered_colnames")
    parser.add_argument("expr_tsv")
    parser.add_argument("-n", dest = "number", default = 100)

    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG,
                      format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    tmeta_dict = {}
    fileh = open(args.transcript_metadata)
    metaheader = fileh.next().strip().split('\t')
    for line in fileh:
        line = line.strip().split('\t')
        transcript_id = line[0]
        meta = line[0:10]
        tmeta_dict[transcript_id] = meta

    i=0
    headero = metaheader[0:10]
    print '\t'.join(headero)
    for transcript_id in open(args.ordered_rownames):
        if i >= args.number: continue
        transcript_id = transcript_id.strip()
        meta = tmeta_dict[transcript_id]
        lineo = meta
        print '\t'.join(lineo)
        i+=1

    return 0

if __name__ == '__main__':
    sys.exit(main())
