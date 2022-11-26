#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";

import { ArgumentParser } from "argparse";

import { crawl, Folder } from "./crawler";
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
})

const args = parser.parse_args();
const output_dir = path.resolve(process.cwd(), args.output);

const folders: Folder[] = args.roots.map((r: string) => crawl(path.resolve(r)));
const documents = folders.map(
    f => compileMarkdown(f, output_dir)
);

fs.outputFileSync(path.resolve(output_dir, "bundle.md"), documents.join("\n\n"));
