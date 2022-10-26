#!/bin/bash

cd misc/circuits/
rm -f *.aux
rm -f *.fdb_latexmk
rm -f *.fls
rm -f *.log
rm -f *.synctex.gz
rm -f *.synctex\(busy\)

for file in *.pdf
do
  svg="${file%.*}.svg"
  pdf2svg $file $svg
  sed -i \
    -e 's/rgb(0%,0%,0%)/#94a3b8/g' \
    -e 's/rgb(100%,100%,100%)/#0f172a/g' \
    -e 's/rgb(100%,0%,0%)/white/g' \
    $svg
done
