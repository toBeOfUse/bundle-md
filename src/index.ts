import fs from "fs";

import { ArgumentParser } from "argparse";

import { crawl } from "./crawler";
import { buildDirSVG } from "./drawer";

const parser = new ArgumentParser({
    description: "Bundle README files from different directories into a single Markdown file."
});

parser.add_argument("roots", {
    metavar: "root_directory",
    type: "str",
    nargs: "+"
});

const args = parser.parse_args();

for (const root of args.roots) {
    console.log(crawl(root));
}

fs.writeFileSync("test.svg", buildDirSVG(crawl(args.roots[0])));
