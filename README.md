# ffxiv-datamining-mixed

提供混合的FFXIV csv解包文件，格式同 [xivapi/ffxiv-datamining](https://github.com/xivapi/ffxiv-datamining) ，但同时提供多种语言／客户端的解包。 <br>
从 国服7.25／国际服7.31 开始提供。


## 使用方法

### 获取解包数据

项目在根目录的以下文件夹内存放csv解包文件：
| 目录  | 服务器 |   语言   |
| :---: | :----: | :------: |
| `chs` |  国服  | 简体中文 |
| `en`  | 国际服 |   英语   |
| `ja`  | 国际服 |   日语   |

你可以直接在GitHub网页上查看csv文件，但是可能会卡。一般推荐直接 [下载项目压缩包](https://github.com/InfSein/ffxiv-datamining-mixed/archive/refs/heads/master.zip) 。 <br>
此外，可以通过 [提交记录](https://github.com/InfSein/ffxiv-datamining-mixed/commits/master/) 对比来获取版本更新内容。

我们一般会在 版本更新且SaintCoinach更新 之后尽快提供解包更新，不过仍可能会有意外发生。 <br>
当我们没有及时更新，或是你有本地解包的需要时，可以参阅下方指引进行本地编译。

### 本地编译获取解包

项目本体是一个解包工具，基于 基于[xivapi/SaintCoinach](https://github.com/xivapi/SaintCoinach)的[thewakingsands/dumpcsv](https://github.com/thewakingsands/dumpcsv) 制作。 <br>
为了项目结构需要，此项目实际使用的是复刻／修改后的 [InfSein/dumpcsv](https://github.com/InfSein/dumpcsv) 。

如果想要从本地的游戏文件中提取出csv文件，请确保：
* 已安装 `.NET 7 运行时` 和 `NodeJS (推荐22.x)`

然后，按照以下步骤操作：
1. 下载或clone此项目；
2. 在项目目录下打开终端，执行 `npm i` ；
3. 将项目根目录下的 `config.json.example` 复制一份，重命名为 `config.json`  <br>
   然后在其中相应的位置填写你国服／国际服的游戏目录；
   > 如果你不需要解包某些服务器的文本，则不需要填写其目录，在后续步骤中不执行对应解包指令即可。
4. 在终端执行 `npm run update-unpacker` ，更新解包工具；
5. 按需执行以下解包指令。
   | 解包指令              | 说明                                          |
   | :------------------- | :------------------------------------------- |
   | `npm run unpack:chs` | 解包国服文本，输出简体中文的csv到 `chs` 目录下。 |
   | `npm run unpack:en`  | 解包国际服文本，输出英文的csv到 `en` 目录下。    |
   | `npm run unpack:ja`  | 解包国际服文本，输出日文的csv到 `ja` 目录下。    |
如此即可完成初次解包。 <br>
在初次解包之后，下次及之后的解包可以直接从第4步开始。

#### 协助更新

如果你已经成功完成了本地解包，而我们没有及时更新，你可以发起一个 [PR](https://github.com/InfSein/ffxiv-datamining-mixed/pulls) 。 <br>
为了保持项目的提交整洁，请确保你的PR符合以下要求：
* 没有对解包文件夹之外的文件作出无意义的修改
* 每个语言的解包更新只进行一次提交
  > 例如在对国际服游戏文件进行了解包，更新了en和ja文件夹， <br>
  > 此时应当进行两次提交，分别为 `data: 国际服xxx／英语` 和 `data: 国际服xxx／日语` 。 <br>
* 提交格式类似
  ```
  # 国服示例
  [标题] data: 国服7.31
  [内容] CHS 2025.09.03.0000.0000
  # 国际服示例
  [标题] data: 国际服7.31／日语
  [内容] GLOBAL 2025.09.03.0000.0000
  # “内容”中的游戏版本号，执行解包指令时会在终端输出。
  ```
不合适的PR可能会被修改或关闭。

## 项目结构
```
ffxiv-datamining-mixed
├── scripts
│   ├── unpack.ts          # 脚本：执行解包
│   └── update-unpacker.ts # 脚本：更新解包工具
├── tools
│   └── unpacker           # 解包工具
├── config.json            # 本地配置
└── config.json.example    # 本地配置示例
```
