declare namespace NSX {
  interface Config {
    note: string[]
    notebook: string[]
    // 暂时未支持
    todo?: string[]
  }

  interface Notebook {
    category: string
    title: string
    ctime: number
    mtime: number
    // 书架
    stack: string
  }

  interface Attachment {
    md5: string
    name: string
    size: number
    width: number
    height: number
    type: string
    ctime: number
  }

  interface Note {
    category: string
    parent_id: string
    title: string
    ctime: number
    mtime: number
    thumb: string | null
    latitude: number
    longitude: number
    encrypt: boolean
    attachment: Record<string, Attachment>
    brief: string
    content: string
    tag: string[]
  }

  interface Todo {
    category: string
    parent_id: string
    note_id: string
    title: string
    star: boolean
    done: boolean
    comment: string
    priority: number
    due_date: number
    reminder_offset: number
  }
}
