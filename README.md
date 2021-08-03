# Frontend bundling legacy js kodov
Browserify bundling umoznujuci odseparovanie legacy kodov do 
modulov a pokrytie testami

## Prerekvizity
- node v12+

## Inštalácia
- `npm i`

## Skripty
Sú obsiahnuté v package.json:scripts

- `npm run build` - zbuilduje projektové súbory do bundlov, ktoré používa `index.html`, momentálne používa watcher, takže sa sám od seba nevypne
- `npm test` - spustí Jest testy