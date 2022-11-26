import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({
    description: "Bundle README files from different directories into a single Markdown file."
});

parser.add_argument("roots", {
    metavar: "root_directory",
    type: "str",
    nargs: "+"
});

console.dir(parser.parse_args());
