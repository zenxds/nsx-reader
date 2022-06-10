# nsx-reader

nsx-reader is a tool to unzip .nsx file from Synology Note Station。

nsx-reader是一个解压群晖Note Station导出的nsx文件的工具。

## command line use

```
yarn global add nsx-reader

nsx-reader test.nsx -o outputDir
```

## code use

```
import Reader from 'nsx-reader'

const reader = new Reader({
  src: path.join(__dirname, 'test.nsx'),
  outputDir: path.join(__dirname, 'output')
})

await reader.unzip()
const noteInfo = reader.getNoteInfo()
reader.generate(noteInfo)
reader.clean()
```

## TODO

* chart support
