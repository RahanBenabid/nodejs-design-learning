#!/bin/sh

FILE="package.json"
if [ -e "$FILE" ]; then
  echo "file exists..."
else
  npm init -y
  
  # Define an array with filenames and their content
  files="strings-el.js|Γεια σου κόσμε
  strings-en.js|Hello World
  strings-es.js|Hola mundo
  strings-it.js|Ciao mondo
  strings-pl.js|Witaj świecie"
  
  # Loop through each entry
  echo "$files" | while IFS="|" read -r filename content; do
    echo "export const HELLO = '$content'" > "$filename"
    echo "Created $filename"
  done
fi
