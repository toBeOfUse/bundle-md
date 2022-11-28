import fs from "fs";
import path from "path";

import minimatch from "minimatch";

import { Readme, getReadme } from "./parser";

interface Folder {
    path: string;
    children: Folder[];
    description?: Readme;
    treeSVG?: string;
    link?: string;
}

/**
 * Crawl a folder and turn it into a Folder object.
 * @param dir_path string path to root directory which will recursively be
 * turned into a Folder object; can be relative or absolute
 * @returns Folder object complete with children, all with a Readme object based
 * on their contents.md and readme.md files (but no treeSVG)
 */
function crawl(
    dir_path: string, exclude_globs: string[]
): Folder {
    const result = recursiveCrawl(dir_path, exclude_globs);
    return result;
}

function recursiveCrawl(dir_path: string, exclude: string[]): Folder {
    const children = fs.readdirSync(dir_path)
        .map(c => path.join(dir_path, c)).sort();
    const folder: Folder = {
        path: dir_path,
        children: [] as Folder[],
        description: getReadme(dir_path),
    };
    for (const child of children) {
        const path_for_glob = child.split("\\").join("/");
        if (
            fs.lstatSync(child).isDirectory() &&
            !exclude.some(e => minimatch(path_for_glob, e))
        ) {
            folder.children.push(recursiveCrawl(child, exclude));
        }
    }
    return folder;
}

/**
 * Recursively updates Folder paths to be relative to a root directory, but
 * including the root directory's name at the beginning of the path, so it's
 * really more like making the paths relative to the root's parent, but without
 * making the assumption that the root's parent exists. Also uses a particular
 * path separator if you want; the output from this is more decorative than
 * functional.
 */
function makePathsRelativeTo(
    folder: Folder, root_path: string, useSep: string = path.sep
) {
    folder.path = path.basename(root_path) + path.sep +
        path.relative(root_path, folder.path);
    folder.path = folder.path.split(path.sep).join(useSep);
    if (!folder.path.startsWith(useSep)) {
        // add opening slash if necessary
        folder.path = useSep + folder.path
    }
    if (!folder.path.endsWith(useSep)) {
        // add ending slash if necessary
        folder.path = folder.path + useSep;
    }
    for (const child of folder.children) {
        makePathsRelativeTo(child, root_path, useSep);
    }
}

export { crawl, makePathsRelativeTo, Folder };
