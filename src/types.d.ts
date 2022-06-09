declare namespace Reader {
  interface Options {
    src: string
    unzipDir?: string
    outputDir: string
  }

  interface NoteInfoItem {
    title: string
    stack: string
    notes: NSX.Note[]
  }

  interface NoteInfo {
    notebook: Record<string, NoteInfoItem>
  }
}
