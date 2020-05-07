import csv


lineCount = getLineCount()
print "Row Count: " lineCount


def getWealthDistributions(numberOfRows):
    totalWealthOfPercentiles = [0,0,0,0,0,0,0,0,0,0]
    with open('cleaned_balances.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        rowsRead = 0
        maxBalance = 0
        maxRow = []
        maxRowNum = 0
        for row in csv_reader:
            if rowsRead == 0:
                print "Reading file...", row 
                rowsRead += 1
            else:
                if (row[0] == 'address'):
                    continue

                balance = int(row[1])
                if (maxBalance < balance):
                    maxBalance = balance
                    maxRow = row
                    maxRowNum = rowsRead
                rowsRead += 1

        print("Maximum Balance: ", maxBalance, maxRow, maxRowNum)

def getLineCount():
    # Expensive, but only way to get accurate row count
    print("Counting Rows...")
    with open('cleaned_balances.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        rowsRead = 0

        for row in csv_reader:
            if (row[0] == 'address'):
                continue
            rowsRead += 1

    csv_file.close()
    return rowsRead
