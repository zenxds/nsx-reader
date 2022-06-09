"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const extract_zip_1 = __importDefault(require("extract-zip"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const dayjs_1 = __importDefault(require("dayjs"));
class NSXReader {
    constructor(options) {
        this.options = options;
        this.unzipDir = options.unzipDir || path_1.default.join(os_1.default.tmpdir(), 'nsx-reader');
        this.outputDir = options.outputDir;
        this.template = this.compile();
        fs_extra_1.default.ensureDirSync(this.unzipDir);
        fs_extra_1.default.ensureDirSync(this.outputDir);
    }
    compile() {
        const env = new nunjucks_1.default.Environment();
        env.addFilter('dayjs', (time, format = 'YYYY-MM-DD HH:mm:ss') => {
            return (0, dayjs_1.default)(time * 1000).format(format);
        });
        const template = nunjucks_1.default.compile(fs_1.default.readFileSync(path_1.default.join(__dirname, '../template/note.html'), 'utf-8'), env);
        return template;
    }
    unzip() {
        const { src } = this.options;
        const { unzipDir } = this;
        return (0, extract_zip_1.default)(src, {
            dir: unzipDir
        });
    }
    getNoteInfo() {
        const config = this.readFile(this.resolveSource('config.json'));
        const ret = {
            notebook: {
                recycle: {
                    title: '_回收站',
                    stack: '',
                    notes: []
                }
            }
        };
        config.notebook.forEach((file) => {
            const notebook = this.readFile(this.resolveSource(file));
            ret.notebook[file] = {
                title: notebook.title,
                stack: notebook.stack,
                notes: []
            };
        });
        config.note.forEach((file) => {
            const note = this.readFile(this.resolveSource(file));
            if (ret.notebook[note.parent_id]) {
                ret.notebook[note.parent_id].notes.push(note);
            }
            else {
                ret.notebook.recycle.notes.push(note);
            }
        });
        return ret;
    }
    readFile(file) {
        const content = fs_1.default.readFileSync(file, 'utf8');
        return JSON.parse(content);
    }
    generate(noteInfo) {
        const { outputDir, template } = this;
        for (const key in noteInfo.notebook) {
            const notebook = noteInfo.notebook[key];
            notebook.notes.forEach((note) => {
                const { title, attachment } = note;
                const dir = notebook.stack ? path_1.default.join(outputDir, notebook.stack, notebook.title, `${title}`) : path_1.default.join(outputDir, notebook.title, `${title}`);
                fs_extra_1.default.ensureDirSync(dir);
                fs_1.default.writeFileSync(path_1.default.join(dir, 'index.html'), template.render(note));
                for (let i in attachment) {
                    const item = attachment[i];
                    const file = this.resolveSource(`file_${item.md5}`);
                    fs_extra_1.default.copySync(file, path_1.default.join(dir, 'attachments', `${item.name}`));
                }
            });
        }
    }
    clean() {
        fs_extra_1.default.removeSync(this.unzipDir);
    }
    resolveSource(p) {
        return path_1.default.join(this.unzipDir, p);
    }
}
exports.default = NSXReader;
