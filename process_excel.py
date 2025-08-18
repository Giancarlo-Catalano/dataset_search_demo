import pandas as pd
import sys
import json

url = sys.argv[1]  # Excel file URL passed as an argument

# Read the Excel file directly from the URL
df = pd.read_excel(url)

# Count rows
row_count = len(df)

# Save to JSON
info = {"rows": row_count}
with open("spreadsheetInfo.json", "w") as f:
    json.dump(info, f, indent=2)

print(f"Row count: {row_count}")
