/// <reference path="./src/nsx.d.ts" />
/// <reference path="./src/types.d.ts" />

import nunjucks from 'nunjucks'

declare class NSXReader {
  public options: Reader.Options
  public unzipDir: string
  public outputDir: string
  public template: nunjucks.Template

  public constructor(options: Reader.Options)
  public unzip(): Promise<void>
  public getNoteInfo(): Reader.NoteInfo
  public generate(noteInfo: Reader.NoteInfo): void
  public clean(): void
  public compile(): nunjucks.Template
  public readSource<T>(file: string): T
  public readTemplate(file: string): string
  private resolveSource(p: string): string
}

export default NSXReader
