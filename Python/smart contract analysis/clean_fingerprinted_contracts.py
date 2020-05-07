import csv

with open('fingerprinted_contracts.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    cleanedFile = open('cleaned_fingerprinted_contracts.csv', 'wb')
    csvWriter = csv.writer(cleanedFile)
    rowsRead = 0
    cleanedLines = 0
    firstLabel = ""
    for row in csv_reader:
        if rowsRead == 0:
            print("Cleaning file...", row)
            csvWriter.writerow(row)
            firstLabel = row[0]
            rowsRead += 1
        else:
            if (rowsRead % 1000000 == 0):
                print("Progress = ", rowsRead)

            if (row[0] == firstLabel):
                cleanedLines += 1
            else:
                csvWriter.writerow(row)

            
            rowsRead += 1

    print("Lines Cleaned: ", cleanedLines)