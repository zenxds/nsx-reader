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
        const { noteTemplate, todoTemplate } = this.compile();
        this.unzipDir = options.unzipDir || path_1.default.join(os_1.default.tmpdir(), 'nsx-reader');
        this.outputDir = options.outputDir;
        this.noteTemplate = noteTemplate;
        this.todoTemplate = todoTemplate;
        this.pathMap = {};
        fs_extra_1.default.ensureDirSync(this.unzipDir);
        fs_extra_1.default.ensureDirSync(this.outputDir);
    }
    compile() {
        const env = new nunjucks_1.default.Environment();
        env.addFilter('dayjs', (time, format = 'YYYY-MM-DD HH:mm:ss') => {
            return (0, dayjs_1.default)(time * 1000).format(format);
        });
        env.addFilter('boolean', (val) => {
            return val ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>';
        });
        env.addFilter('priority', (val) => {
            const map = {
                '-1': '',
                '100': '低',
                '200': '中',
                '300': '高'
            };
            return map[val] || '';
        });
        const noteTemplate = nunjucks_1.default.compile(this.readTemplate('note.html'), env);
        const todoTemplate = nunjucks_1.default.compile(this.readTemplate('todo.html'), env);
        return {
            noteTemplate,
            todoTemplate
        };
    }
    unzip() {
        const { src } = this.options;
        const { unzipDir } = this;
        return (0, extract_zip_1.default)(src, {
            dir: unzipDir
        });
    }
    getNoteInfo() {
        const config = this.readSource('config.json');
        const ret = {
            todo: [],
            recycle: {
                title: '回收站',
                stack: '',
                notes: []
            },
            notebook: {}
        };
        config.notebook.forEach((file) => {
            const notebook = this.readSource(file);
            ret.notebook[file] = {
                title: notebook.title,
                stack: notebook.stack,
                notes: []
            };
        });
        config.note.forEach((file) => {
            const note = this.readSource(file);
            if (ret.notebook[note.parent_id]) {
                ret.notebook[note.parent_id].notes.push(Object.assign({ id: file }, note));
            }
            else {
                ret.recycle.notes.push(Object.assign({ id: file }, note));
            }
        });
        if (config.todo) {
            const map = {};
            config.todo.forEach((file) => {
                const item = this.readSource(file);
                map[file] = Object.assign({ tasks: [], id: file }, item);
                if (!item.parent_id) {
                    ret.todo.push(map[file]);
                }
            });
            config.todo.forEach((file) => {
                const item = this.readSource(file);
                if (item.parent_id) {
                    const parent = map[item.parent_id];
                    parent.tasks.push(item);
                }
            });
        }
        return ret;
    }
    readSource(file) {
        const content = fs_1.default.readFileSync(this.resolveSource(file), 'utf8');
        return JSON.parse(content);
    }
    readTemplate(file) {
        return fs_1.default.readFileSync(path_1.default.join(__dirname, `../template/${file}`), 'utf-8');
    }
    generateNotebook(notebook, category) {
        const { outputDir, noteTemplate } = this;
        notebook.notes.forEach((note) => {
            const { title, attachment } = note;
            const dirs = [outputDir, category || '', notebook.stack, notebook.title, title].filter(Boolean);
            const dir = path_1.default.join(...dirs);
            const file = path_1.default.join(dir, 'index.html');
            const extra = [];
            this.pathMap[note.id] = file;
            for (let key in attachment) {
                const { width, height } = attachment[key];
                if (!width && !height) {
                    extra.push(attachment[key]);
                }
            }
            fs_extra_1.default.ensureDirSync(dir);
            fs_1.default.writeFileSync(file, noteTemplate.render(Object.assign({
                extra,
                style: this.readTemplate('style.css'),
                script: this.readTemplate('script.js')
            }, note)));
            for (let i in attachment) {
                const item = attachment[i];
                const file = this.resolveSource(`file_${item.md5}`);
                fs_extra_1.default.copySync(file, path_1.default.join(dir, 'attachments', `${item.name}`));
            }
        });
    }
    generateTodo(todo) {
        const { outputDir, todoTemplate } = this;
        const dir = path_1.default.join(outputDir, '待办事项');
        const file = path_1.default.join(dir, `${todo.title}.html`);
        fs_extra_1.default.ensureDirSync(dir);
        fs_1.default.writeFileSync(file, todoTemplate.render(Object.assign({
            noteLink: todo.note_id ? path_1.default.relative(path_1.default.dirname(file), this.pathMap[todo.note_id]) : '',
            style: this.readTemplate('style.css'),
        }, todo)));
    }
    generate(noteInfo) {
        for (const key in noteInfo.notebook) {
            this.generateNotebook(noteInfo.notebook[key], '记事本');
        }
        this.generateNotebook(noteInfo.recycle);
        noteInfo.todo.forEach((item) => {
            this.generateTodo(item);
        });
    }
    clean() {
        fs_extra_1.default.removeSync(this.unzipDir);
    }
    resolveSource(p) {
        return path_1.default.join(this.unzipDir, p);
    }
}
exports.default = NSXReader;
