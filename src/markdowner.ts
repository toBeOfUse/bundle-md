import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { Folder } from "./crawler";

const hash = (s: string) =>
    crypto.createHash("md5").update(s).digest("hex");

/**
 * Sequence of Markdown strings and objects representing SVG images.
 */
type MDDocument = (string | { filename: string, xml: string })[];

function buildDocument(
    folder: Folder, depth: number, images_dir: string
): MDDocument {
    if (!folder.description?.details && !folder.treeSVG) {
        return [];
    }
    let result: MDDocument = [
        Array(depth).fill("#").join("") + " " + folder.path + "\n\n"
    ];
    if (folder.treeSVG) {
        result.push({
            xml: folder.treeSVG,
            filename: hash(folder.treeSVG) + ".svg"
        });
    }
    if (folder.description?.details) {
        result.push(folder.description.details);
    }
    for (const child of folder.children) {
        result = result.concat(buildDocument(child, depth + 1, images_dir));
    }
    return result;
}

function compileMarkdown(
    folder: Folder, output_path: string, images_dirname: string = "images"
): string {
    const imagesPath = path.resolve(output_path, images_dirname);
    const document = buildDocument(folder, 1, images_dirname);
    let result = "";
    for (const element of document) {
        if (typeof element == "string") {
            result += element;
        } else {
            const imagePath = path.resolve(imagesPath, element.filename);
            fs.outputFileSync(imagePath, element.xml);
            result += `\n![file tree](${images_dirname}/${element.filename})\n`
        }
    }
    return result;
}

export { compileMarkdown };
