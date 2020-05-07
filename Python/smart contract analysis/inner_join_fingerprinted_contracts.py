from pandas import DataFrame, read_csv
import pandas as pd 
import matplotlib.pyplot as plt
import csv

# file = r'cleaned_fingerprinted_contracts.csv'
# print("Reading file...")
# df = pd.read_csv(file, dtype={"address": str, "fingerprint": str, "logical duplicates": int})
# print("Read File!", len(df.index) , " rows")
# print "Starting inner join."

def tooDifferent(a, b):
    lengthA = len(a)
    lengthB = len(b)
    difference = abs(len(a)-len(b))
    percentDifferent = difference/len(a)
    tooDifferent = percentDifferent > 0
    return tooDifferent
fingerprints = []
with open('fingerprinted_contracts.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    rowsRead = 0
    for row in csv_reader:
        if rowsRead == 0:
            print("Reading file...", row)
            rowsRead += 1
        else:
            if (rowsRead % 1000000 == 0):
                print("Progress = ", rowsRead)

            fingerprints.append(row[1])

            
            rowsRead += 1

    print("Rows Read: ", rowsRead)

csv_file.close()

print "Starting Pairwise"
pairwiseFingerprints = [] #[ [fingerprintA, fingerprintB] for i,fingerprintA in enumerate(fingerprints) for j,fingerprintB in enumerate(fingerprints) if (i != j and i<3 and not tooDifferent(fingerprintA,fingerprintB))]
i = 0
j = 0
for a in fingerprints:
    if (i>=1):
        break
    i+=1
    for b in fingerprints:
        if (i != j and not tooDifferent(a,b)):
            pairwiseFingerprints.append([a,b])
        j+=1
        

print "Done!"
pairwiseFile = open('pairwise.csv', 'wb')
csvWriter = csv.writer(pairwiseFile)

k = 0
for row in pairwiseFingerprints:
    if (k % 10000000 == 0):
            print("Progress = ", i)
    csvWriter.writerow(row)
    k+=1

pairwiseFile.close()
print "Saved!"
