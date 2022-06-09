import os from 'os'
import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import extract from 'extract-zip'
import nunjucks from 'nunjucks'
import dayjs from 'dayjs'

export default class NSXReader {
  public options: Reader.Options
  private unzipDir: string
  private outputDir: string
  private template: nunjucks.Template

  public constructor(options: Reader.Options) {
    this.options = options

    this.unzipDir = options.unzipDir || path.join(os.tmpdir(), 'nsx-reader')
    this.outputDir = options.outputDir
    this.template = this.compile()

    fse.ensureDirSync(this.unzipDir)
    fse.ensureDirSync(this.outputDir)
  }

  public compile(): nunjucks.Template {
    const env = new nunjucks.Environment()
    env.addFilter('dayjs', (time, format='YYYY-MM-DD HH:mm:ss'): string  => {
      return dayjs(time * 1000).format(format)
    })
    const template = nunjucks.compile(this.readTemplate('note.html'), env)

    return template
  }

  public unzip(): Promise<void> {
    const { src } = this.options
    const { unzipDir } = this

    return extract(src, {
      dir: unzipDir
    })
  }

  public getNoteInfo(): Reader.NoteInfo {
    const config = this.readFile<NSX.Config>(this.resolveSource('config.json'))
    const ret: Reader.NoteInfo = {
      notebook: {
        recycle: {
          title: '_回收站',
          stack: '',
          notes: []
        }
      }
    }

    config.notebook.forEach((file): void => {
      const notebook = this.readFile<NSX.Notebook>(this.resolveSource(file))
      ret.notebook[file] = {
        title: notebook.title,
        stack: notebook.stack,
        notes: []
      }
    })

    config.note.forEach((file): void => {
      const note = this.readFile<NSX.Note>(this.resolveSource(file))
      if (ret.notebook[note.parent_id]) {
        ret.notebook[note.parent_id].notes.push(note)
      } else {
        ret.notebook.recycle.notes.push(note)
      }
    })

    return ret
  }

  public readFile<T>(file: string): T {
    const content = fs.readFileSync(file, 'utf8')
    return JSON.parse(content)
  }

  public readTemplate(file: string): string {
    return fs.readFileSync(path.join(__dirname, `../template/${file}`), 'utf-8')
  }

  public generate(noteInfo: Reader.NoteInfo): void {
    const { outputDir, template } = this

    for (const key in noteInfo.notebook) {
      const notebook = noteInfo.notebook[key]

      notebook.notes.forEach((note): void => {
        const { title, attachment } = note
        const dir = notebook.stack ? path.join(outputDir, notebook.stack, notebook.title, `${title}`) : path.join(outputDir, notebook.title, `${title}`)
        const extra: NSX.Attachment[] = []

        for (let key in attachment) {
          const { width, height } = attachment[key]
          if (!width && !height) {
            extra.push(attachment[key])
          }
        }

        fse.ensureDirSync(dir)
        fs.writeFileSync(path.join(dir, 'index.html'), template.render(Object.assign({
          extra,
          style: this.readTemplate('style.css'),
          script: this.readTemplate('script.js')
        }, note)))

        for (let i in attachment) {
          const item = attachment[i]
          const file = this.resolveSource(`file_${item.md5}`)
          fse.copySync(file, path.join(dir, 'attachments', `${item.name}`))
        }
      })
    }
  }

  public clean(): void {
    fse.removeSync(this.unzipDir)
  }

  private resolveSource(p: string): string {
    return path.join(this.unzipDir, p)
  }
}
