import os from 'os'
import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import extract from 'extract-zip'
import nunjucks from 'nunjucks'
import dayjs from 'dayjs'

export default class NSXReader {
  public options: Reader.Options
  public unzipDir: string
  public outputDir: string
  public noteTemplate: nunjucks.Template
  public todoTemplate: nunjucks.Template
  public pathMap: Record<string, string>

  public constructor(options: Reader.Options) {
    this.options = options

    const { noteTemplate, todoTemplate } = this.compile()
    this.unzipDir = options.unzipDir || path.join(os.tmpdir(), 'nsx-reader')
    this.outputDir = options.outputDir
    this.noteTemplate = noteTemplate
    this.todoTemplate = todoTemplate
    this.pathMap = {}

    fse.ensureDirSync(this.unzipDir)
    fse.ensureDirSync(this.outputDir)
  }

  public compile(): Record<string, nunjucks.Template> {
    const env = new nunjucks.Environment()
    env.addFilter('dayjs', (time, format='YYYY-MM-DD HH:mm:ss'): string  => {
      return dayjs(time * 1000).format(format)
    })

    env.addFilter('boolean', (val): string  => {
      return val ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'
    })

    env.addFilter('priority', (val): string  => {
      const map: Record<string, string> = {
        '-1': '',
        '100': '低',
        '200': '中',
        '300': '高'
      }
      return map[val] || ''
    })

    const noteTemplate = nunjucks.compile(this.readTemplate('note.html'), env)
    const todoTemplate = nunjucks.compile(this.readTemplate('todo.html'), env)

    return {
      noteTemplate,
      todoTemplate
    }
  }

  public unzip(): Promise<void> {
    const { src } = this.options
    const { unzipDir } = this

    return extract(src, {
      dir: unzipDir
    })
  }

  public getNoteInfo(): Reader.NoteInfo {
    const config = this.readSource<NSX.Config>('config.json')
    const ret: Reader.NoteInfo = {
      todo: [],
      recycle: {
        title: '回收站',
        stack: '',
        notes: []
      },
      notebook: {}
    }

    config.notebook.forEach((file): void => {
      const notebook = this.readSource<NSX.Notebook>(file)
      ret.notebook[file] = {
        title: notebook.title,
        stack: notebook.stack,
        notes: []
      }
    })

    config.note.forEach((file): void => {
      const note = this.readSource<NSX.Note>(file)
      if (ret.notebook[note.parent_id]) {
        ret.notebook[note.parent_id].notes.push(Object.assign({ id: file }, note))
      } else {
        ret.recycle.notes.push(Object.assign({ id: file }, note))
      }
    })

    if (config.todo) {
      const map: Record<string, Reader.Todo> = {}
      config.todo.forEach((file): void => {
        const item = this.readSource<NSX.Todo>(file)

        map[file] = Object.assign({ tasks: [], id: file }, item)
        if (!item.parent_id) {
          ret.todo.push(map[file])
        }
      })

      config.todo.forEach((file): void => {
        const item = this.readSource<NSX.Todo>(file)
        if (item.parent_id) {
          const parent = map[item.parent_id]
          parent.tasks.push(item)
        }
      })
    }

    return ret
  }

  public readSource<T>(file: string): T {
    const content = fs.readFileSync(this.resolveSource(file), 'utf8')
    return JSON.parse(content)
  }

  public readTemplate(file: string): string {
    return fs.readFileSync(path.join(__dirname, `../template/${file}`), 'utf-8')
  }

  private generateNotebook(notebook: Reader.Notebook, category?: string): void {
    const { outputDir, noteTemplate } = this

    notebook.notes.forEach((note): void => {
      const { title, attachment } = note
      const dirs = [outputDir, category || '', notebook.stack, notebook.title, title].filter(Boolean)
      const dir = path.join(...dirs)
      const file = path.join(dir, 'index.html')
      const extra: NSX.Attachment[] = []

      this.pathMap[note.id] = file

      for (let key in attachment) {
        const { width, height } = attachment[key]
        if (!width && !height) {
          extra.push(attachment[key])
        }
      }

      fse.ensureDirSync(dir)
      fs.writeFileSync(file, noteTemplate.render(Object.assign({
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

  private generateTodo(todo: Reader.Todo): void {
    const { outputDir, todoTemplate } = this
    const dir = path.join(outputDir, '待办事项')
    const file = path.join(dir, `${todo.title}.html`)

    fse.ensureDirSync(dir)
    fs.writeFileSync(file, todoTemplate.render(Object.assign({
      noteLink: todo.note_id ? path.relative(path.dirname(file), this.pathMap[todo.note_id]) : '',
      style: this.readTemplate('style.css'),
    }, todo)))

  }

  public generate(noteInfo: Reader.NoteInfo): void {
    for (const key in noteInfo.notebook) {
      this.generateNotebook(noteInfo.notebook[key], '记事本')
    }

    this.generateNotebook(noteInfo.recycle)

    noteInfo.todo.forEach((item): void => {
      this.generateTodo(item)
    })
  }

  public clean(): void {
    fse.removeSync(this.unzipDir)
  }

  public resolveSource(p: string): string {
    return path.join(this.unzipDir, p)
  }
}
