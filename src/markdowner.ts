import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import slugify from "slugify";
import { Folder } from "./crawler";

const hash = (s: string) =>
    crypto.createHash("md5").update(s).digest("hex").substring(0, 8);

/**
 * Sequence of Markdown strings and objects representing SVG images.
 */
type MDDocument = (string | { filename: string, xml: string })[];

function buildDocument(
    folder: Folder, depth: number, images_dir: string
): MDDocument {
    let result: MDDocument = [];
    if (folder.description?.details?.length || folder.treeSVG) {
        const header = folder.link ?
            `[${folder.path}](${folder.link})` :
            folder.path;
        result.push(Array(depth).fill("#").join("") + " " + header);
    }
    if (folder.treeSVG) {
        result.push({
            xml: folder.treeSVG,
            filename: slugify(folder.path.replace(path.sep, "-")) +
                "-" + hash(folder.treeSVG) + ".svg"
        });
    }
    const hasSubfoldersHole = folder.description?.details && folder.description.details.length > 1;
    if (folder.description?.details) {
        result.push(folder.description.details[0]);
        if (hasSubfoldersHole) {
            result.push(`\n\n<details open><summary>Subfolders of ${folder.path}</summary>\n\n`);
        }
    }
    for (const child of folder.children) {
        result = result.concat(buildDocument(child, depth + 1, images_dir));
    }
    if (hasSubfoldersHole) {
        result.push("\n\n<hr>\n\n</details>\n\n");  // no such thing as too many newlines
        result = result.concat(folder.description!.details!.slice(1));
    }
    return result;
}

/**
 * Turns a Folder object and its children into a Markdown string with the
 * contents of their Readme objects, saving each of their treeSVGs as an image
 * file. (Does not save a Markdown file.) IMPORTANT: Folder object paths should
 * be formatted as they should be displayed; they will not be used to read
 * anything and can be relative to whatever you want and use whatever path
 * separators you want, etc.
 * @param folder Folder object; it and its children's state will be written in
 * the Markdown string and image files. Paths need to be pre-formatted strings.
 * @param output_path string path being used for the program's output; used to
 * save images.
 * @param image_width number that will be used as the width attribute in the
 * output img tags.
 * @param images_dir name of the image directory. images will be saved to
 * output_path/images_dir.
 * @returns Markdown string containing hotlinks to images (using the relative
 * path images_dir/image_filename.svg) and text from folder.description.details
 */
function compileMarkdown(
    folder: Folder, output_path: string,
    image_width: number, images_dirname: string = "images"
): string {
    const imagesPath = path.resolve(output_path, images_dirname);
    const document = buildDocument(folder, 1, images_dirname);
    let result = "";
    for (const element of document) {
        if (typeof element == "string") {
            result += "\n" + element + "\n";
        } else {
            const imagePath = path.resolve(imagesPath, element.filename);
            fs.outputFileSync(imagePath, element.xml);
            result +=
                `\n\n<img src="${images_dirname}/${element.filename}" ` +
                `width="${image_width}" height="auto">\n\n`;
        }
    }
    return result;
}

export { compileMarkdown };
