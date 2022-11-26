import fs from "fs";
import path from "path";

import he from "he";
import { JSDOM } from "jsdom";
const doc = new JSDOM("").window.document;

import { Folder } from "./crawler";

const lineHeight = 10;
const indentWidth = 10;
const textHeight = 6;
const iconHeight = 8;

function getLineGroup(
    type: "file" | "folder", index: number, depth: number, text: string
) {
    const g = doc.createElement("g");
    g.setAttribute(
        "transform",
        `translate(${indentWidth * depth} ${index * lineHeight})`
    );
    // TODO: html-encode text
    g.innerHTML = `
    <use x="0" y="${lineHeight - iconHeight}" width="${iconHeight}"
        height="${iconHeight}" href="#${type}"></use>

    <text dominant-baseline="middle" x="${iconHeight * 1.5}"
        y="${lineHeight - textHeight / 2}" font-size="${textHeight}"
        font-family="sans-serif">${he.encode(text)}</text>`
    return g;
}

function buildDirSVG(root: Folder): string {
    const svg = doc.createElement("svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const defs = doc.createElement("defs");
    const svgDeps = ["file", "folder"];
    for (const dep of svgDeps) {
        const depContents = fs.readFileSync(
            path.resolve(__dirname, "assets", dep + ".svg"),
            { encoding: "utf-8" }
        );
        defs.insertAdjacentHTML("beforeend", depContents);
        (defs.lastChild as SVGElement).setAttribute("id", dep);
    }
    svg.appendChild(defs);
    let index = 0;
    function recursiveBuild(folder: Folder, depth: number) {
        console.log(folder);
        const folderName = path.parse(folder.path).name;
        svg.appendChild(getLineGroup("folder", index++, depth, folderName));
        for (const child of folder.children) {
            recursiveBuild(child, depth + 1);
        }
        const desc = folder.description?.contents;
        for (const d of desc || []) {
            svg.appendChild(getLineGroup("file", index++, depth + 1, d));
        }
    }
    recursiveBuild(root, 0);
    svg.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", `0 0 250 ${index * lineHeight}`);
    return svg.outerHTML;
}

export { buildDirSVG };
