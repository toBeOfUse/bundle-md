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

/**
 * Crawl a folder and turn it into a Folder object.
 * @param dir_path string path to root directory which will recursively be
 * turned into a Folder object; can be relative or absolute
 * @returns Folder object complete with children; the root with a treeSVG image;
 * all with a Readme object based on their contents.md and readme.md files
 */
function crawl(dir_path: string): Folder {
    const result = recursiveCrawl(dir_path);
    result.treeSVG = buildDirSVG(result);
    return result;
}

function recursiveCrawl(dir_path: string): Folder {
    const children = fs.readdirSync(dir_path)
        .map(c => path.join(dir_path, c)).sort();
    const folder: Folder = {
        path: dir_path,
        children: [] as Folder[],
        description: getReadme(dir_path)
    };
    for (const child of children) {
        if (fs.lstatSync(child).isDirectory()) {
            folder.children.push(recursiveCrawl(child));
        }
    }
    return folder;
}

export { crawl, Folder };
