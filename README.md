Yami rpg editor is 2D rpg editor on user-friendliness.

 - Official website: https://yami.io
 - Documentation:  https://yami.io/docs

## Build 
```shell
npm install
```

## Run 
```shell
esbuild Script/index.jsx --jsx-factory=createElement --jsx-fragment=Fragment --bundle --outfile=Dist/index.js
esbuild Script/editor/src/index.js --jsx-factory=createElement --jsx-fragment=Fragment --bundle --platform=node --external:electron --outfile=Dist/data.js
npm run start
```

## Packing 
```shell
# windows
npm run pack-win

# macos
npm run pack-macos
```
