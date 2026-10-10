# Design Physics Playground

一个可直接运行和修改的单屏物理交互网页：图片与文字可以拖拽、旋转、碰撞，点击画布会生成新图片。

**原生 HTML / CSS / JavaScript · 无需构建 · 无需安装依赖 · 支持离线运行**

## 下载并运行

### 方法一：直接双击（最简单）

1. 在 GitHub 点击 **Code → Download ZIP**。
2. 解压整个文件夹，保留 `assets` 目录。
3. 双击 `index.html`，用 Chrome、Edge、Firefox 或 Safari 打开。

不要只下载 `index.html`，页面需要同目录中的 CSS、JavaScript 和图片。

### 方法二：本地服务器

如果安装了 Node.js 18 或更新版本，在项目目录运行：

```sh
npm start
```

打开 http://127.0.0.1:3000 。不需要执行 `npm install`。

也可以使用 Python：

```sh
python3 -m http.server 3000 --bind 127.0.0.1
```

Windows 的 Python 命令通常可以写为 `py -m http.server 3000 --bind 127.0.0.1`。
服务器运行时保持终端打开，按 `Ctrl+C` 停止。

## 如何玩

- 初始显示 **7 张图片**。
- 点击或轻触画布，添加一张图片，从第 8 张开始循环使用全部 15 张。
- 按住图片或文字拖动，松手后保留旋转与惯性。
- 鼠标划过物体会轻微推动它们。
- 右下角重置按钮或左上角 **Design** 恢复初始布局。
- Tab 聚焦卡片后，方向键移动；Enter / 空格新增图片。
- 导航保留视觉和悬停效果，没有页面跳转。
- 最多保留 24 张额外图片，超过后替换最早新增的图片。
- 支持移动端和系统减少动态效果设置。

## 修改项目

| 文件 | 用途 |
| --- | --- |
| `index.html` | Logo、导航、四个字块、介绍文案、默认图片 |
| `style.css` | 颜色、字体、尺寸、响应式布局 |
| `physics.js` | 初始位置、重力、碰撞、拖拽、新增与重置 |
| `assets/art-001.jpg` … `art-015.jpg` | 图片素材 |
| `assets/matter.min.js` | 本地打包的 Matter.js 物理引擎 |
| `serve.cjs` | 可选的零依赖 Node.js 本地服务器 |

### 换图片

最简单的方法是用自己的图片覆盖 `assets/art-001.jpg` 至 `art-015.jpg`，保持名称一致。前 7 张为初始图片，其余通过点击出现。图片显示在正方形卡片中，默认居中裁切。

如需更改图片数量，请同时更新 `physics.js` 的 `spawnImages` 数组和 `index.html` 中的默认图片。新增默认卡片还需要在 `layout` 和移动端 `mob` 配置里添加相同的 `data-key`。

### 改文字与尺寸

在 `index.html` 搜索 `GOGO！`、`WEBPAGE`、`AI`、`CREATE` 或介绍文案进行修改。较长文字可以在 `style.css` 调整字号；如果改变卡片尺寸，请同时修改 `physics.js` 中 `layout` 对应的宽、高，使显示与碰撞边界一致。

### 调整手感

`physics.js` 中：

- `engine.gravity.y`：重力。
- `restitution`：碰撞弹性。
- `frictionAir`：运动阻力。
- `stiffness`：拖拽约束强度。

### 检查 JavaScript

```sh
npm run check
```

修改后刷新浏览器即可，无需构建。所有运行资源都在项目内，没有 API Key、后台服务或 CDN 请求。

## 部署到 GitHub Pages

上传到自己的公开仓库后，进入 **Settings → Pages**，选择 **Deploy from a branch**，分支选择 `main`，目录选择 `/ (root)`，保存即可。也可以把整个目录放到任何静态网站托管服务。

## 许可证

项目代码使用 [MIT](LICENSE)。图片和第三方依赖的授权范围见 [ASSET-LICENSE.md](ASSET-LICENSE.md)。开源包使用系统字体，所以字形与之前的在线演示略有不同。

## English quick start

Download and unzip the full repository, then open `index.html`. Alternatively, run `npm start` with Node.js 18+ and visit http://127.0.0.1:3000. No dependencies or build step are required.

Edit `index.html` for copy, `style.css` for appearance, and `physics.js` for interaction. Seven images are visible initially; clicking adds more. Drag and throw any piece. Code is MIT licensed; supplied artwork is excluded from that license. See `ASSET-LICENSE.md`.
