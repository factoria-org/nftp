#!/usr/bin/env node
process.removeAllListeners('warning')
const { I } = require('ipfsio')
const inquirer = require('inquirer')
const homedir = require('os').homedir();
const path = require('path')
const ora = require('ora');
const fs = require('fs')
const keyPath = homedir + "/.nftstorage";
const upload = async (key, target) => {
  const i = new I(key)
  let targetPath = path.resolve(process.cwd(), target)
  const stat = await fs.promises.lstat(targetPath)
  let cid
  let type
  if (stat.isDirectory()) {
    type = "directory"
    cid = await i.folder(targetPath)
  } else if (stat.isFile()) {
    type = 'file'
    cid = await i.file(targetPath)
  } else {
    console.log("error", stat)
  }
  return { cid, type }
}
const render = (r) => {
  if (r.cid) {
    console.log("########################################################################################################")
    console.log("#")
    console.log("# IPFS CID: " + r.cid)
    if (r.type === 'directory') {
      console.log("# IPFS URI: ipfs://" + r.cid + "/")
    } else if (r.type === 'file') {
      console.log("# IPFS URI: ipfs://" + r.cid)
    }
    console.log("# IPFS Gateway: https://ipfs.io/ipfs/" + r.cid)
    console.log("#")
    console.log("########################################################################################################")
  }
}
if (process.argv.length < 3) {
  console.log("please enter the file/folder path to upload.")
  process.exit(1)
}
const target = process.argv[2]
if (fs.existsSync(keyPath)) {
  let key = fs.readFileSync(keyPath, "utf8")
  const throbber = ora('uploading').start();
  console.time("upload duration")
  upload(key, target).then((r) => {
    throbber.stop();
    render(r)
    console.log("")
    console.timeEnd("upload duration")
  })
} else {
  inquirer.prompt([{
    type: 'input',
    name: "key",
    message: 'NFT.STORAGE API KEY',
  }]).then((answers) => {
    fs.writeFileSync(keyPath, answers.key)
    const throbber = ora('uploading').start();
    console.time("upload duration")
    upload(answers.key, target).then((r) => {
      throbber.stop();
      render(r)
      console.log("")
      console.timeEnd("upload duration")
    })
  })
}
