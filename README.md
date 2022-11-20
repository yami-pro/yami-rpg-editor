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
esbuild View/index.tsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --outdir=Build --watch
# 启动ts的文件监听
esbuild index.ts --bundle --platform=node --external:electron --sourcemap=inline --outfile=Build/script.js --watch
# 启动
npm run start
```

## Packing 
```shell
rm -r Build/
esbuild View/index.tsx --jsx-factory=createElement --jsx-fragment=null --bundle --external:*.png --external:*.woff2 --outdir=Build
esbuild index.ts --bundle --platform=node --external:electron --outfile=Build/script.js

# windows
npm run pack-win

# macos
npm run pack-macos
```
