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
const imageWidth = 250;
const padding = 5;

function getLineGroup(
    type: "file" | "folder", index: number, depth: number, text: string
) {
    const g = doc.createElement("g");
    g.setAttribute(
        "transform",
        `translate(${indentWidth * depth} ${index * lineHeight})`
    );
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
    let index = 0;
    function recursiveBuild(folder: Folder, depth: number) {
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
    const imageHeight = index * lineHeight;
    const bg = doc.createElement("rect");
    bg.setAttribute("x", (-padding).toString());
    bg.setAttribute("y", (-padding).toString());
    bg.setAttribute("width", (imageWidth + padding * 2).toString());
    bg.setAttribute("height", (imageHeight + padding * 2).toString());
    bg.setAttribute("fill", "white");
    svg.prepend(bg);
    svg.prepend(defs);
    svg.setAttributeNS(
        "http://www.w3.org/2000/svg",
        "viewBox",
        `-${padding} 0 ${imageWidth + padding * 2} ${imageHeight + padding * 2}`
    );
    return svg.outerHTML;
}

export { buildDirSVG };
