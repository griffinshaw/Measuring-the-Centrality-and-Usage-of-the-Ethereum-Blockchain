from pandas import DataFrame, read_csv
import pandas as pd 
import matplotlib.pyplot as plt

file = r'balances_sorted_ranked.csv'
print("Reading file...")
df = pd.read_csv(file, dtype={"address": str, "eth_balance": float, "percentage_of_total_wealth": float, "most_recent_send": float, "most_recent_recieve": float, 'wealth_rank': float})
print("Read File!", len(df.index) , " rows")
df.plot.line(x='wealth_rank', y='eth_balance')
plt.show()
