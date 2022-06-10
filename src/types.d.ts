declare namespace Reader {
  interface Options {
    src: string
    unzipDir?: string
    outputDir: string
  }

  interface Notebook {
    title: string
    stack: string
    notes: Note[]
  }

  interface Note extends NSX.Note {
    id: string
  }

  interface Todo extends NSX.Todo {
    id: string
    tasks: NSX.Todo[]
  }

  interface NoteInfo {
    todo: Todo[]
    recycle: Notebook
    notebook: Record<string, Notebook>
  }
}
