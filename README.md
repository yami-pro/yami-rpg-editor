Yami rpg editor is 2D rpg editor on user-friendliness.

 - Official website: https://yami.io
 - Documentation:  https://yami.io/docs

## Build 
```shell
npm install
```

## Run 
```shell
esbuild View/index.jsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --outdir=Build
npm run start
```

## Packing 
```shell
rm -r Build/
esbuild View/index.jsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --outdir=Build
esbuild index.js --jsx-factory=createElement --jsx-fragment=null --bundle --platform=node --external:electron --outfile=Build/script.js

# windows
npm run pack-win

# macos
npm run pack-macos
```
