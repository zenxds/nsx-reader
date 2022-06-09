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
    reader.generate(noteInfo)
    reader.clean()
  })

})
