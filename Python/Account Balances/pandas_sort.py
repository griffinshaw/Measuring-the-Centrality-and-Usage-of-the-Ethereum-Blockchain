from pandas import DataFrame, read_csv
import pandas as pd 
import matplotlib.pyplot as plt

file = r'cleaned_balances.csv'
print("Reading file...")
df = pd.read_csv(file, dtype={"address": str, "eth_balance": float, "percentage_of_total_wealth": float, "most_recent_send": float, "most_recent_recieve": float})
print("Read File!", len(df.index) , " rows")
df['wealth_rank'] = df['eth_balance'].rank(method='max', na_option='bottom')
print("Ranked by balance")
df.sort_values(by=['eth_balance'], ascending=False)
print("Sorted by balance")
df.to_csv("balances_sorted_ranked.csv", encoding='utf-8', index=False)
