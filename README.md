Yami rpg editor is 2D rpg editor on user-friendliness.

 - Official website: https://yami.io
 - Documentation:  https://yami.io/docs

## Build 
```shell
npm install
```

## Run 
```shell
esbuild Script/index.jsx --jsx-factory=createElement --jsx-fragment=Fragment --bundle --outfile=dist-page.js
esbuild Script/index.js --jsx-factory=createElement --jsx-fragment=Fragment --bundle --platform=node --external:electron --outfile=dist-script.js
npm run start
```

## Packing 
```shell
# windows
npm run pack-win

# macos
npm run pack-macos
```
