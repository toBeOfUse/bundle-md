import fs from "fs";
import path from "path";

import { Readme, getReadme } from "./parser";

interface Folder {
    path: string;
    children: Folder[];
    description?: Readme;
}

function crawl(dir_path: string): Folder {
    const children = fs.readdirSync(dir_path)
        .map(c => path.join(dir_path, c)).sort();
    const folder: Folder = { path: dir_path, children: [] as Folder[] };
    for (const child of children) {
        if (fs.lstatSync(child).isDirectory()) {
            folder.children.push(crawl(child));
        } else if (path.parse(child).base.toLowerCase() == "readme.md") {
            folder.description = getReadme(child);
        }
    }
    return folder;
}

export { crawl, Folder };
