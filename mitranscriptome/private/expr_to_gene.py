'''
Created on Aug 12, 2014
@author yniknafs
'''


import os
import sys
import argparse
import logging
import collections


'''
take file with counts for isoforms and collapse into counts for gene

'''


    
def main():
    # parse command line
    parser = argparse.ArgumentParser()
    parser.add_argument("expr_file")
    parser.add_argument("meta")
    
    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG,
                      format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    logging.info('Reading metadata file')
    fileh = open(args.meta)
    header = fileh.next().strip().split('\t')
    gene_dict = {}
    for line in fileh: 
        line = line.strip().split('\t')
        tid = line[header.index("transcript_id")]
        gid = line[header.index("gene_id")]
        gene_dict[tid] = gid
    
    tot = 380000
    logging.info('Collapsing expr dat to the gene level')
    fileh = open(args.expr_file)
    header = fileh.next().strip().split('\t')
    expr_dict = collections.defaultdict(lambda: collections.defaultdict(lambda:0))
    i = 0 
    for line in fileh: 
        line = line.strip().split('\t')
        tid = line[0]
        gid = gene_dict[tid]
        i+=1
        if i%50==0:
            logging.debug("Finished %d/%d genes" % (i, tot))
        for pt in header[1:]: 
            val = float(line[header.index(pt)])
            expr_dict[pt][gid] += val
    
    logging.info('Printing gene level data')
    headero = ['gene_id']
    for pt in expr_dict.iterkeys():
        
        headero.append(pt)
    print '\t'.join(headero)
    genes = sorted(expr_dict[headero[1]].keys())
    for gene in genes: 
        lineo = [gene]
        for pt in headero[1:]:
            val = expr_dict[pt][gene]
            lineo.append(val)
        print '\t'.join(map(str, lineo))
     
        
        
    return 0

if __name__ == '__main__': 
    sys.exit(main())
