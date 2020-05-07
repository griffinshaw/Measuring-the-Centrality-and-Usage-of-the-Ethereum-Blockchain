import csv
from pandas import DataFrame, read_csv
import pandas as pd 
import matplotlib.pyplot as plt


allBalances = []

with open('cleaned_balances.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    rowsRead = 0
    firstLabel = ""
    for row in csv_reader:

        if rowsRead == 0:
            print( "Reading file...", row )
            rowsRead += 1
        else:
            if (rowsRead % 1000000 == 0):
                print"Progress = ", rowsRead
            allBalances.append(int(row[1])) 
            rowsRead += 1
    print ("Sorting balances...")

    allBalances.sort(reverse=True)

logFigure = plt.figure()
logFigure.canvas.set_window_title('Logarithmic Distribution')
axLog = logFigure.add_subplot(1, 1, 1)
axLog.set_yscale("log")
axLog.plot(allBalances)
axLog.grid(True,which="both", linestyle='--')
axLog.set_title("Distribution of Wei Across Accounts")
axLog.set_ylabel('Wei')
axLog.set_xlabel('Accounts')


linearFigure = plt.figure()
linearFigure.canvas.set_window_title('Linear Distribution')
axLinear = linearFigure.add_subplot(1, 1, 1)
axLinear.plot(allBalances)
axLinear.grid(True,which="both", linestyle='--')
axLinear.set_title("Distribution of Wei Across Accounts")
axLinear.set_ylabel('Accounts')
plt.show()




    
