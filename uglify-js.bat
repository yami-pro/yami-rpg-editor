@echo off
cd Script
uglifyjs util.js file.js components.js codec.js webgl.js audio.js printer.js data.js plugin.js variable.js attribute.js enum.js tools.js title.js layout.js scene.js ui.js animation.js particle.js palette.js sprite.js browser.js inspector.js command.js log.js main.js -c -m -o yami.min.js --toplevel