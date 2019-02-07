node build.js

find ./src -name '*.html' -exec cp -prv '{}' './dist/' ';'

find ./src -name '*.css' -exec cp -prv '{}' './dist/' ';'

cp -r images dist/

cp -r libs dist/
