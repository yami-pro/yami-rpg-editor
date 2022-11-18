Yami rpg editor is 2D rpg editor on user-friendliness.

 - Official website: https://yami.io
 - Documentation:  https://yami.io/docs

## Build 
```shell
npm install
```

## Run 
```shell
# rm -r Dist/
esbuild View/index.jsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --outdir=Dist
# esbuild index.js --jsx-factory=createElement --jsx-fragment=null --bundle --platform=node --external:electron --outfile=Dist/script.js
npm run start
```

## Packing 
```shell
# windows
npm run pack-win

# macos
npm run pack-macos
```
