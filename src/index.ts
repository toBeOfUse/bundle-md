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
    default: "output"
});

const args = parser.parse_args();
const output_dir = path.resolve(process.cwd(), args.output);
const roots = args.roots.map((r: string) => path.resolve(process.cwd(), r));

const folders: Folder[] = roots.map(crawl);

for (let i = 0; i < folders.length; i++) {
    const root = roots[i];
    makePathsRelativeTo(folders[i], root, "/");
}

const documents = folders.map(f => compileMarkdown(f, output_dir));

fs.outputFileSync(path.resolve(output_dir, "bundle.md"), documents.join("\n\n"));
