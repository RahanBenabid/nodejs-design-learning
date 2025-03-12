import { EventEmitter } from "events";
import { readFile } from "fs";

function findRegex(files, regex) {
    const emitter = new EventEmitter();
    for (const file of files) {
        readFile(file, 'utf-8', (err, content) => {
            if (err) {
                return emitter.emit('error', err);
            }

            emitter.emit('fileread', file);
            const match = content.match(regex);
            if (match) {
                match.forEach(elem => emitter.emit('found', file, elem));
            }
        });
    }
    return emitter;
}

findRegex(["data.txt", "data2.txt"], "laborum")
    .on('fileread', file => console.log(`${file} was read`))
    .on('found', (file, match) => { console.log(`file ${file} matched ${match}`) })
    .on('error', err => console.error(`Error emitted ${err}`))