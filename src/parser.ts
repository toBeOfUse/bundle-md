import fs from "fs";

interface Readme {
    contents: string;
    details: string;
}

const contentSummaryDemarcator = "contents:";

function getReadme(path: string): Readme {
    const readme = fs.readFileSync(path, { encoding: "utf-8" })
        .replace(/\r\n/g, "\n");
    let contents = "";
    const lines = readme.split("\n");
    for (const line of lines) {
        if (line.toLowerCase().startsWith(contentSummaryDemarcator)) {
            contents = line.substring(contentSummaryDemarcator.length).trim();
            break;
        }
    }
    return {
        contents,
        details: readme
    };
}

export { Readme, getReadme };
