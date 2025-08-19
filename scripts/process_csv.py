import pandas as pd
import json

# Read local CSV from repo
df = pd.read_csv("database_information.csv")

# Count rows
row_count = len(df)

# You can also gather extra info if you want:
col_count = len(df.columns)
columns = list(df.columns)

info = {
    "rows": row_count,
    "columns": col_count,
    "column_names": columns
}

with open("spreadsheetInfo.json", "w") as f:
    json.dump(info, f, indent=2)

print("Processed database_information.csv")
print(json.dumps(info, indent=2))
