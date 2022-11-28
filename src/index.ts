#!/usr/bin/env node

import path from "path";

import fs from "fs-extra";
import { ArgumentParser } from "argparse";

import { crawl, Folder, makePathsRelativeTo } from "./crawler";
import { compileMarkdown } from "./markdowner";
import { buildDirSVG } from "./drawer";

const parser = new ArgumentParser({
    description: "Bundle README files from different directories into a single Markdown file."
});

parser.add_argument("roots", {
    metavar: "root_directory",
    type: "str",
    nargs: "+"
});

parser.add_argument("--output", "-o", {
    metavar: "output_directory",
    type: "str",
    default: "bundle-md-output"
});

parser.add_argument("--exclude", "-e", {
    metavar: "exclude_directories",
    type: "str",
    nargs: "+"
});

parser.add_argument("--exclude-glob", {
    metavar: "exclude_glob",
    type: "str",
    nargs: "+"
});

parser.add_argument("--no-tree", {
    metavar: "treeless_directories",
    type: "str",
    nargs: "+"
});

parser.add_argument("--extra-tree", {
    metavar: "extra_tree_directories",
    type: "str",
    nargs: "+"
});

const args = parser.parse_args();
const output_dir = path.resolve(process.cwd(), args.output);
const resolver = (p: string) => path.resolve(process.cwd(), p);
const roots: string[] = args.roots.map(resolver);
const exclude_globs: string[] = args.exclude_glob || ["**/node_modules", "**/.*"];
const excluded: string[] = args.exclude?.map(resolver) || [];
const no_tree = new Set<string>(args.no_tree?.map(resolver) || []);
const extra_tree = new Set<string>(args.extra_tree?.map(resolver) || []);

console.log("crawling folders");
const folders: Folder[] = roots
    .filter(r => !excluded.includes(r))
    .map(r => crawl(r, excluded.concat(exclude_globs)));

console.log("drawing trees");
(function drawTrees(retrieved: Folder[]) {
    for (const folder of retrieved) {
        if (
            (roots.includes(folder.path) && !no_tree.has(folder.path)) ||
            extra_tree.has(folder.path)
        ) {
            folder.treeSVG = buildDirSVG(folder);
        }
        drawTrees(folder.children);
    }
})(folders);

console.log("formatting paths");
for (let i = 0; i < folders.length; i++) {
    const root = roots[i];
    makePathsRelativeTo(folders[i], root, "/");
}

console.log("gathering markdown and images");
const documents = folders.map(f => compileMarkdown(f, output_dir));

const output_file = path.resolve(output_dir, "bundle.md");
fs.outputFileSync(output_file, documents.join("\n\n"));
console.log("output markdown to " + output_file);
