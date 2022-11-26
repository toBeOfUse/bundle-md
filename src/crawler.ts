import fs from "fs";
import path from "path";

import { Readme, getReadme } from "./parser";
import { buildDirSVG } from "./drawer";

interface Folder {
    path: string;
    children: Folder[];
    description?: Readme;
    treeSVG?: string;
}

function crawl(dir_path: string): Folder {
    const result = recursiveCrawl(dir_path, path.resolve(dir_path, "../"));
    result.treeSVG = buildDirSVG(result);
    return result;
}

function recursiveCrawl(dir_path: string, base_path: string): Folder {
    const children = fs.readdirSync(dir_path)
        .map(c => path.join(dir_path, c)).sort();
    const folder: Folder = {
        path: path.relative(base_path, dir_path),
        children: [] as Folder[],
        description: getReadme(dir_path)
    };
    for (const child of children) {
        if (fs.lstatSync(child).isDirectory()) {
            folder.children.push(recursiveCrawl(child, base_path));
        }
    }
    return folder;
}

export { crawl, Folder };
