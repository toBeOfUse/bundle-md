import fs from "fs";
import path from "path";

import { JSDOM } from "jsdom";
const doc = new JSDOM("").window.document;

import { Folder } from "./crawler";

const lineHeight = 10;
const indentWidth = 8;

function getLineGroup(
    type: "file" | "folder", index: number, depth: number, text: string
) {
    const g = doc.createElement("g");
    g.setAttribute(
        "transform",
        `translate(${indentWidth * depth} ${index * lineHeight})`
    );
    // TODO: html-encode text
    g.innerHTML = `<use x="0" y="0" width="${lineHeight}px" height="${lineHeight}px" href="#${type}"></use>
        <text dominant-baseline="middle" x="${indentWidth + lineHeight}px" y="${lineHeight / 2}px" font-size="${lineHeight - 2}px">${text}</text>`
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
        if (desc) {
            svg.appendChild(getLineGroup("file", index++, depth + 1, desc));
        }
    }
    recursiveBuild(root, 0);
    svg.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", `0 0 300 ${index * lineHeight}`);
    return svg.outerHTML;
}

export { buildDirSVG };
