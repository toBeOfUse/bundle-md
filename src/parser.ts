import fs from "fs";
import path from "path";

interface Readme {
    contents: string[];
    details?: string[];
}

/**
 * Grab the data in a directory's Markdown files.
 * @param dir_path string path to directory that hopefully contains a
 * contents.md or readme.md
 * @returns Readme object with a contents array for the strings in contents.md
 * and a details string for the text in readme.md
 */
function getReadme(dir_path: string): Readme {
    let result: Readme = { contents: [] };
    for (const dirent of fs.readdirSync(dir_path, { withFileTypes: true, encoding: "utf-8" })) {
        if (!dirent.isFile()) {
            continue;
        }
        const fullPath = path.resolve(dir_path, dirent.name);
        const casefoldName = dirent.name.toLowerCase();
        // console.log("dirent:", dirent);
        if (casefoldName == "readme.md") {
            // console.log("which is a readme! at path", fullPath);
            result.details = fs.readFileSync(fullPath, { encoding: "utf-8" })
                .split("<!-- subfolders -->");
        } else if (casefoldName == "contents.md") {
            result.contents = fs.readFileSync(fullPath, { encoding: "utf-8" })
                .trim().split("\n").map(l => l.trim()).filter(l => l.length > 0);
        }
    }
    return result;
}

export { Readme, getReadme };
