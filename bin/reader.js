#! /usr/bin/env node

const { program } = require('commander')

const Reader = require('../lib').default
const packageJSON = require('../package.json')

program
  .version(packageJSON.version)
  .usage('<file> [options]')
  .option('-o, --output [path]', 'output path')
  .parse(process.argv)

const options = program.opts()
const src = program.args[0]
const outputDir = options.output

if (!src || !outputDir) {
  process.exit(1)
}

async function start() {
  const reader = new Reader({
    src,
    outputDir
  })

  await reader.unzip()
  const noteInfo = reader.getNoteInfo()
  reader.generate(noteInfo)
  reader.clean()
}

start().then(() => {
  process.exit(0)
}).catch(err => {
  console.log(err)
  process.exit(1)
})
