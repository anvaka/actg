#!/usr/bin/python
# Reads ACGTrie and dumps it into value file format. In value file format
# each record is stored into 32 bits. Value of the record represent frequency
# of the chain in DNA. We use bijective numbers notation with base 4 to map from index
# into chain. This system has only four digits A < C < G < T; There are no zeros
# in this notation. The following illustrates how to map from index into chain:
#
# Index | Chain
#   1       A
#   2       C
#   3       G
#   4       T
#   5       AA
#   6       AC
#   7       AG
#   8       AT
# .....


import numpy
import math
import struct

LEVELS_TO_DUMP = 5
OUT_FILE_NAME = 'out.count'

A = numpy.memmap('ngraph.nohead.ACGTrie.A', dtype='uint32')
C = numpy.memmap('ngraph.nohead.ACGTrie.C', dtype='uint32')
G = numpy.memmap('ngraph.nohead.ACGTrie.G', dtype='uint32')
T = numpy.memmap('ngraph.nohead.ACGTrie.T', dtype='uint32')
COUNT = numpy.memmap('ngraph.nohead.ACGTrie.COUNT', dtype='uint32')
SEQ = numpy.memmap('ngraph.nohead.ACGTrie.SEQ', dtype='int64')

## This function turns the up2bit number in the SEQ column of the trie into a list of 2bit values like the above.
def up2bit_list(value):
    value = int(value) # Numbers in cffi arrays don't have the .bit_length property, so we convert to int.
    return [((value >> x) & 3) for x in range(0,value.bit_length()-1,2)] # This uses bit-shifting to get the pairs of 2 bits at a time.

def getScore(string):
    row = 0                                                             ## We always start on row 0
    counts = []                                                         ## We will return a list of counts for each row we visit
    seq = [('A','C','T','G').index(char) for char in string]            ## Turn the string into a list of 2bit numbers
    while True:
        rowCount = COUNT[row]
        counts.append(rowCount)                                         ## Straight away we will add this row's # value to our rowCount list
        seqLen = len(seq)
        if seqLen == 0: break                                           ## If we have no more DNA in our input string, we're done :)
        up2bit = up2bit_list(SEQ[row])                                  ## Else we get some more data..
        up2bitLen = len(up2bit)
        nextPipe = (A,C,T,G)[seq[0]][row]
        if nextPipe and up2bitLen == 0:                                 ## If we have no more DNA in this row's Seq,
            row = nextPipe                                              ## take the warp pipe to the next row.
            seq = seq[1:]
            continue
        elif seqLen <= up2bitLen:                                       ## If we have more DNA in our row than our string...
            if up2bit[:seqLen] == seq: counts += [rowCount] * seqLen    ## 1) Check they match up. If so add this row's count N times.
            else:
                for x,y in enumerate(seq):                              ## 2) If they dont match up, find where they diverge
                    if y != up2bit[x]: break                            ##    and just add this row's count for that many times
                counts += [rowCount] *  x
        else:                                                           ## Finally, to be here we must have more DNA in our string
            if seq[:up2bitLen] == up2bit:                               ## than in our row. Thus as before we see if they match.
                counts += [rowCount] * up2bitLen                        ## If they do, add N counts to the counts list, and take
                row = (A,C,T,G)[seq[up2bitLen]][row]                         ## the next warp pipe out (if available)
                if row != 0:
                    seq = seq[up2bitLen+1:]
                    continue
            else:                                                       ## Otherwise find out where the two sequences diverge and
                for x,y in enumerate(up2bit):                           ## just add the appropriate number of counts to the counts
                    if y != seq[x]: break                               ## list before bottoming out of the while loop and breaking.
                counts += [rowCount] *  x
        break
    return counts[-1]

def row(x):
    print A[x],C[x],T[x],G[x],COUNT[x],SEQ[x]

ALPHABET = list("ACGT")
def bijective_encode(i):
    if i == 0: return ''
    s = ''

    base = len(ALPHABET)

    q0 = int(i)
    while q0 > 0:
        q1 = int(math.ceil(float(q0)/base) - 1)
        s += ALPHABET[( q0 - base * q1 ) - 1]
        q0 = q1

    return s[::-1] # reverse string

def totalItems(maxNested):
    sum = 0
    while maxNested > 0:
        sum += math.pow(4, maxNested)
        maxNested -= 1

    return int(sum + 1)


fo = open(OUT_FILE_NAME, 'wb')
totalItemsToProcess = totalItems(LEVELS_TO_DUMP)

for x in range(1, totalItemsToProcess):
    sequence = bijective_encode(x)
    score = getScore(sequence)
#    print sequence, ' - ', score
    fo.write(struct.pack('<i', score))

fo.close()
