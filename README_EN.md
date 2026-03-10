# ffxiv-datamining-mixed

**Languages:** [简体中文](README.md) | **English** | [日本語](README_JA.md)

Provides mixed FFXIV CSV unpacked files, in the same format as [xivapi/ffxiv-datamining](https://github.com/xivapi/ffxiv-datamining), but with unpacked data for multiple languages / clients at the same time. <br>
Available starting from CN client 7.25 / Global client 7.31.<br>
※ DE/FR starts from Global client 7.41.<br>
※ TC needs community support.

## Usage

### Obtaining Unpacked Data

The project stores CSV unpacked files in the following directories at the root level:

| Directory |     Server    |       Language      |
| :-------: | :-----------: | :-----------------: |
|   `chs`   |   CN client   |  Simplified Chinese |
|    `tc`   |   TW client   | Traditional Chinese |
|    `ja`   | Global client |       Japanese      |
|    `en`   | Global client |       English       |
|    `de`   | Global client |       German        |
|    `fr`   | Global client |       French        |

You can view the CSV files directly on the GitHub website, but it may be slow. It is generally recommended to directly [download the project archive](https://github.com/InfSein/ffxiv-datamining-mixed/archive/refs/heads/master.zip). <br>
In addition, you can check version update contents via the [commit history](https://github.com/InfSein/ffxiv-datamining-mixed/commits/master/).

We usually provide unpacked updates as soon as possible after a game version update and a SaintCoinach update, but unexpected delays may still occur. <br>
If we do not update in time, or if you need to perform local unpacking, you can refer to the instructions below for local compilation.

### Local Compilation and Unpacking

The project itself is an unpacking tool, based on [thewakingsands/dumpcsv](https://github.com/thewakingsands/dumpcsv) from [xivapi/SaintCoinach](https://github.com/xivapi/SaintCoinach). <br>
For project structure reasons, this project actually uses a forked / modified version: [InfSein/dumpcsv](https://github.com/InfSein/dumpcsv).

If you want to extract CSV files from your local game files, please make sure that:

* `.NET 7 Runtime` and `NodeJS (22.x recommended)` are installed

Then, follow these steps:

1. Download or clone this project;
2. Open a terminal in the project directory and run `npm i`;
3. Copy `config.json.example` in the project root directory and rename it to `config.json` <br>
   Then fill in the corresponding paths to your CN / Global game directories;

   > If you do not need to unpack text for certain servers, you do not need to fill in their directories, and simply do not execute the corresponding unpack commands in later steps.
4. Run `npm run update-unpacker` in the terminal to update the unpacking tool;
5. Execute the following unpack commands as needed.

   | Unpack Command       | Description                                                                        |
   | :------------------- | :--------------------------------------------------------------------------------- |
   | `npm run unpack:chs` | Unpack CN client text, output Simplified Chinese CSV files to the `chs` directory. |
   | `npm run unpack:tc`  | Unpack TC client text, output Traditional Chinese CSV files to the `tc` directory. |
   | `npm run unpack:ja`  | Unpack Global client text, output Japanese CSV files to the `ja` directory.        |
   | `npm run unpack:en`  | Unpack Global client text, output English CSV files to the `en` directory.         |
   | `npm run unpack:de`  | Unpack Global client text, output German CSV files to the `de` directory.         |
   | `npm run unpack:fr`  | Unpack Global client text, output French CSV files to the `fr` directory.         |

This completes the initial unpacking. <br>
After the initial unpack, subsequent unpacking runs can start directly from step 4.

#### Helping with Updates

If you have successfully completed local unpacking and we have not updated in time, you can open a [PR](https://github.com/InfSein/ffxiv-datamining-mixed/pulls). <br>
To keep the project history clean, please ensure that your PR meets the following requirements:

* No unnecessary changes to files outside the unpacked data directories
* Each language’s unpack update should be committed only once

  > For example, if you unpack Global client game files and update both the `en` and `ja` folders, <br>
  > you should make two commits, respectively named `data: GLOBAL xxx／EN` and `data: GLOBAL xxx／JA`. <br>
* Commit format similar to the following:

  ```
  # CN client example
  [Title] data: CHS 7.31
  [Body]  2025.09.03.0000.0000
  # Global client example
  [Title] data: GLOBAL 7.31／JA
  [Body]  2025.09.03.0000.0000
  # The game version number in the “Body” will be printed in the terminal when running the unpack command.
  ```

Inappropriate PRs may be modified or closed.

## Project Structure

```
ffxiv-datamining-mixed
├── scripts
│   ├── unpack.ts          # Script: perform unpacking
│   └── update-unpacker.ts # Script: update the unpacking tool
├── tools
│   └── unpacker           # Unpacking tool
├── config.json            # Local configuration
└── config.json.example    # Local configuration example
```
