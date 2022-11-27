import fs from "fs";
import path from "path";

interface Readme {
    contents?: string[];
    details?: string;
}

/**
 * Grab the data in a directory's Markdown files.
 * @param dir_path string path to directory that hopefully contains a
 * contents.md or readme.md
 * @returns Readme object with a contents array for the strings in contents.md
 * and a details string for the text in readme.md
 */
function getReadme(dir_path: string): Readme {
    let result: Readme = {};
    for (const file of fs.readdirSync(dir_path)) {
        const casefoldName = path.parse(file).base.toLowerCase();
        const fullPath = path.resolve(dir_path, file);
        if (casefoldName == "readme.md") {
            result.details = fs.readFileSync(fullPath, { encoding: "utf-8" });
        } else if (casefoldName == "contents.md") {
            result.contents = fs.readFileSync(fullPath, { encoding: "utf-8" })
                .trim().split("\n").filter(l => l.trim().length > 0);
        }
    }
    return result;
}

export { Readme, getReadme };
