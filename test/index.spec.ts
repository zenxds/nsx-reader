import fs from 'fs'
import path from 'path'
import Reader from  '../src'

describe('reader', () => {

  test('it should generate', async() => {
    const reader = new Reader({
      src: path.join(__dirname, 'test.nsx'),
      unzipDir: path.join(__dirname, 'src'),
      outputDir: path.join(__dirname, 'output')
    })

    await reader.unzip()
    const noteInfo = reader.getNoteInfo()
    // fs.writeFileSync(path.join(__dirname, 'src/noteInfo.json'), JSON.stringify(noteInfo, null, 2))
    reader.generate(noteInfo)

    expect(fs.existsSync(reader.unzipDir)).toBeTruthy()
    reader.clean()
    expect(fs.existsSync(reader.unzipDir)).toBeFalsy()

    expect(fs.existsSync(reader.outputDir)).toBeTruthy()
  })

})
