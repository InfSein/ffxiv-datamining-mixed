import fs from "fs"
import path from "path"
import { rm } from "node:fs/promises"
import { execSync, spawn } from "child_process"
import AppConfig from "../config.json"
import { spawnSync } from "node:child_process"

// ── 配置 ──────────────────────────────────────────────

const languages = ["chs", "ja", "en", "de", "fr"] as const
type Lang = (typeof languages)[number]

const getServer = (lang: Lang) => {
  switch (lang) {
    case "chs":
      return "chs"
    default:
      return "global"
  }
}

const getCommitServer = (lang: Lang) => {
  return lang === "chs" ? "CHS" : "GLOBAL"
}

const getCommitLangSuffix = (lang: Lang) => {
  return lang === "chs" ? "" : `／${lang.toUpperCase()}`
}

const repoUrl = "https://github.com/InfSein/ffxiv-datamining-mixed"

// ── 工具函数 ───────────────────────────────────────────

/**
 * 执行解包并捕获输出以提取游戏版本号，同时实时转发到终端
 */
function runUnpack(lang: Lang): Promise<string> {
  const server = getServer(lang)
  const gamePath = (AppConfig.gamePath as Record<string, string>)[server]
  if (!gamePath || !fs.existsSync(gamePath)) {
    throw new Error(
      `未找到 ${lang} 的游戏路径，请先配置 config.json 文件。\n gamePath: ${gamePath}`
    )
  }

  const unpackerPath = path.resolve("tools/unpacker/DumpCsv.exe")
  if (!fs.existsSync(unpackerPath)) {
    throw new Error(
      `未找到 unpacker 执行文件。请运行 npm run update-unpacker。\n unpackerPath: ${unpackerPath}`
    )
  }

  const outputPath = path.resolve(`${lang}`)

  return new Promise(async (resolve, reject) => {
    // 清理并重建输出目录
    fs.mkdirSync(outputPath, { recursive: true })
    await rm(outputPath, { recursive: true, force: true })

    console.log(`\n开始进行 ${lang} 的解包...`)

    const child = spawn(
      `"${unpackerPath}"`,
      [`"${gamePath}"`, lang, "rawexd", `"${outputPath}"`],
      {
        cwd: path.dirname(unpackerPath),
        shell: true,
      }
    )

    let fullOutput = ""

    child.stdout.on("data", (data: Buffer) => {
      const text = data.toString()
      fullOutput += text
      process.stdout.write(text)
    })

    child.stderr.on("data", (data: Buffer) => {
      const text = data.toString()
      fullOutput += text
      process.stderr.write(text)
    })

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`解包 ${lang} 失败，退出码: ${code}`))
        return
      }

      // 提取游戏版本号
      const match = fullOutput.match(/Game version:\s*(.+)/)
      if (!match) {
        reject(new Error(`无法从 ${lang} 的解包输出中提取游戏版本号`))
        return
      }

      resolve(match[1].trim())
    })

    child.on("error", (err) => {
      reject(new Error(`解包 ${lang} 进程启动失败: ${err.message}`))
    })
  })
}

/**
 * 检查 git 是否有文件变更
 */
function hasGitChanges(): boolean {
  const status = execSync("git status --porcelain", { encoding: "utf-8" })
  return status.trim().length > 0
}

/**
 * 创建 git commit 并返回 commit hash
 */
function createCommit(message: string): string {
  execSync("git add -A", { stdio: "inherit" })

  const args = message
    .split("\n")
    .map(line => `-m "${line}"`)
    .join(" ")

  execSync(`git commit ${args}`, { stdio: "inherit" })

  const hash = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim()
  return hash
}

/**
 * 获取上一个 git tag
 */
function getLastTag(): string | null {
  try {
    return execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
    }).trim()
  } catch {
    return null
  }
}

// ── 主流程 ─────────────────────────────────────────────

async function main() {
  const patch = process.argv[2]
  if (!patch) {
    console.error("❌ 请提供版本号参数。\n示例：npm run release -- 7.45")
    process.exit(1)
  }

  console.log(`🚀 开始发布流程: Patch ${patch}\n`)

  // 1. 更新解包工具
  console.log("═══════════════════════════════════════")
  console.log("📦 步骤 1/3: 更新解包工具")
  console.log("═══════════════════════════════════════")
  execSync("npm run update-unpacker", { stdio: "inherit" })

  // 2. 依次解包各语言并 commit
  console.log("\n═══════════════════════════════════════")
  console.log("📤 步骤 2/3: 解包并提交")
  console.log("═══════════════════════════════════════")

  const commitHashes: Record<string, string> = {}
  let gameVersion = ""

  for (const lang of languages) {
    console.log(`\n── ${lang.toUpperCase()} ──────────────────────`)

    const version = await runUnpack(lang)
    gameVersion = version
    console.log(`\n✅ ${lang.toUpperCase()} 游戏版本号: ${version}`)

    if (hasGitChanges()) {
      const server = getCommitServer(lang)
      const langSuffix = getCommitLangSuffix(lang)
      const commitMsg = `data: ${server} ${patch}${langSuffix}\n${version}`
      const hash = createCommit(commitMsg)
      commitHashes[lang] = hash
      console.log(`📝 已创建 commit: ${hash}`)
    } else {
      console.log(`⏭️ ${lang.toUpperCase()} 无文件变更，跳过 commit`)
    }
  }

  // 3. 创建 GitHub Release
  console.log("\n═══════════════════════════════════════")
  console.log("🏷️ 步骤 3/3: 创建 GitHub Release")
  console.log("═══════════════════════════════════════")

  const lastTag = getLastTag()

  // 推送所有 commits 和 tag
  console.log("\n📤 推送 commits 到远程...")
  execSync("git push", { stdio: "inherit" })

  // 构建 Release 内容
  const releaseTitle = `Unpack ${patch}`
  const commitLines = languages
    .map((lang) => {
      const hash = commitHashes[lang]
      if (!hash) return `* ${lang.toUpperCase()}: (无变更)`
      return `* ${lang.toUpperCase()}: ${repoUrl}/commit/${hash}`
    })
    .join("\n")

  const lastVersionRef = lastTag?.replace(/v/, '') ?? "初始版本"
  const releaseBody = `View differences from \`${lastVersionRef}\` :\n${commitLines}`

  // 使用 gh CLI 创建 Release
  const tagName = `v${patch}`.replace(/#/g, '-')
  spawnSync(
    "gh",
    [
      "release",
      "create",
      tagName,
      "--title",
      releaseTitle,
      "--notes",
      releaseBody
    ],
    { stdio: "inherit" }
  )

  console.log(`\n🎉 发布完成！`)
  console.log(`   版本: ${patch}`)
  console.log(`   游戏版本号: ${gameVersion}`)
  console.log(`   Release: ${repoUrl}/releases/tag/${tagName}`)
}

main().catch((err) => {
  console.error("\n❌ 发布流程失败:", err.message)
  process.exit(1)
})
