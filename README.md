

## Current workflow:

1. When you upload a new database_information.csv file, a Github Action is triggered. The file is in .github/workflows/when_database_information_changed.yml
2. The yaml file will call a Python script that generates an index from that csv, and a webpage for each entry. When the script is finished, it commits the new database_information.csv, the index, and the webpages
3. When that script is finished, then there's another Github Action that turns it into a website

## When things go wrong.
 When something goes wrong, you will see it in the github action.
 If you modify the columns of the spreadsheet, you'll need to modify the Python code.
 If you want to modify how the individual pages look, you'll need to modify the Python code. (Not great..)


 
