'''
python db_create_sample_tsv.py /Volumes/dx11/mctp/projects/ssea/isoform_count_matrix_v7/colnames.txt /Volumes/dx11/mctp/projects/ssea/isoform_count_matrix_v7/colmeta.tsv > samples.big.tsv
'''
import sys
import os
import argparse
import logging

def main():
    # parse command line
    parser = argparse.ArgumentParser()
    parser.add_argument("ordered_colnames")
    parser.add_argument("sample_metadata")
    args = parser.parse_args()
    
    logging.basicConfig(level=logging.DEBUG,
                        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    tissue_dict = {}
    fileh = open(args.sample_metadata)
    header = fileh.next().strip().split('\t')
    for line in fileh:
        line = line.strip().split('\t')
        library_id = line[header.index("library_id")].lower()
        tissue = line[header.index("cohort")]
        tissue_dict[library_id] = tissue

    i=0
    headero = ['library_id', 'tissue']
    print '\t'.join(headero)
    for library_id in open(args.ordered_colnames):
        library_id = library_id.strip().lower()
        tissue = tissue_dict[library_id]
        lineo = [library_id, tissue]
        print '\t'.join(lineo)
        i+=1

    return 0

if __name__ == '__main__':
    sys.exit(main())
