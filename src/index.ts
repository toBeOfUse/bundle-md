#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";

import { ArgumentParser } from "argparse";

import { crawl, Folder, makePathsRelativeTo } from "./crawler";
import { compileMarkdown } from "./markdowner";

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

const args = parser.parse_args();
const output_dir = path.resolve(process.cwd(), args.output);
const resolver = (p: string) => path.resolve(process.cwd(), p);
const roots = args.roots.map(resolver);
const excluded = args.exclude?.map(resolver) || ["node_modules", ".git"];

const folders: Folder[] = roots.map(crawl);
(function removeExcluded(retrieved: Folder[], excluded: Set<string>) {
    let i = 0;
    while (i < retrieved.length) {
        if (excluded.has(retrieved[i].path)) {
            // console.log(retrieved[i].path, "is in excluded set", excluded);
            retrieved.splice(i, 1);
        } else {
            // console.log(retrieved[i].path, "is not in excluded set", excluded);
            removeExcluded(retrieved[i].children, excluded);
            ++i;
        }
    }
})(folders, new Set(excluded));

for (let i = 0; i < folders.length; i++) {
    const root = roots[i];
    makePathsRelativeTo(folders[i], root, "/");
}

const documents = folders.map(f => compileMarkdown(f, output_dir));

fs.outputFileSync(path.resolve(output_dir, "bundle.md"), documents.join("\n\n"));
