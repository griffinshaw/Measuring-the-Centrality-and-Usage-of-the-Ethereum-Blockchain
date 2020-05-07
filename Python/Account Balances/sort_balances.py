import csv

def compareBalances(rowA, rowB):
        balanceA = int(rowA[1])
        balanceB = int(rowB[1])
        if (balanceA > balanceB):
            return 1
        elif (balanceA == balanceB):
            return 0
        else:
            return -1

with open('cleaned_balances.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    #sortedFile = open('sorted_balances.csv', 'wb')

    allBalances = []
    #csvWriter = csv.writer(sortedFile)
    rowsRead = 0
    firstLabel = ""
    for row in csv_reader:
        if rowsRead >100000:
            break #temp

        if rowsRead == 0:
            print( "Reading file...", row )
            #csvWriter.writerow(row)
            rowsRead += 1
        
        else:
            if (rowsRead % 1000000 == 0):
                print( "Progress = ", rowsRead )

            allBalances.append(row) # Expensive AF
                

            
            rowsRead += 1

    # csvWriter.writerow(row)
    print ("Sorting balances... dear god")
    allBalances.sort(key=lambda row: int(row[1]), reverse=True)
    print ("Rows In Memory: ", len(allBalances) , "First: ", allBalances[0], "Last: ", allBalances[len(allBalances) -1] )
    

    
