Yami rpg editor is 2D rpg editor on user-friendliness.

 - Official website: https://yami.io
 - Documentation:  https://yami.io/docs

## Build 
```shell
npm install
```

## Run 
```shell
# 启动tsx的文件监听
esbuild view/index.tsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --outdir=build --watch
# 启动ts的文件监听
esbuild main.ts --bundle --platform=node --external:electron --sourcemap --outfile=main.js --watch
esbuild index.ts --bundle --platform=node --external:electron --sourcemap --outfile=build/script.js --watch
# 启动
npm run start
```

## Packing 
```shell
rm -r build/
esbuild view/index.tsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --sourcemap --outdir=build
esbuild main.ts --bundle --platform=node --external:electron --sourcemap --outfile=main.js
esbuild index.ts --bundle --platform=node --external:electron --sourcemap --outfile=build/script.js

# windows
npm run pack-win

# macos
npm run pack-macos
```
