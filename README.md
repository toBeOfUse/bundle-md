# Bundle.md

This is a command-line tool that will traverse a repository, find its README.md and CONTENTS.md files, and bundle them into a single Markdown document. The result looks like this:

![example](sample.png)

[\(Full example.)](https://github.com/toBeOfUse/bundle-md-demo/wiki/Folder-Architecture) Each directory given to the program will become a section in the output Markdown file, with the directory's path as the heading, its file tree diagram displayed with the addition of each line in its subfolders' "contents" files, and finally the text of its "readme" file copied into the output directly. Then, this pattern repeats for each of its subfolders, in depth-first and alphabetical order (just like how directories are ordered in file managers.)

If you want a folder's readme text to be separated into some text before and some text after its subfolders' sections, place the line `<!-- subfolders -->` in the folder's readme where you want the subfolder sections to go. If you do this, they will be enclosed in an HTML `<details>` folder element and followed by a horizontal rule to show where they start and end.

## Usage:

```
npx bundle-md root_directory_1 [root_directory_2 ...] [options...]
```

If there is more than one root directory, each will be processed separately and then their outputs will be concatenated.

### Options:

```
  --output output_directory, -o output_directory
  --exclude exclude_directories [exclude_directories ...], -e exclude_directories [exclude_directories ...]
  --exclude-glob exclude_glob [exclude_glob ...] = ["**/node_modules", "**/.*"]
  --no-tree treeless_directories [treeless_directories ...]
  --extra-tree extra_tree_directories [extra_tree_directories ...]
  --image-width image_width_px = 500
  --image-scale image_display_scale = 1.0
  --link-to url_base
  --signoff, --no-signoff
```

All directory paths should be specified relative to the current working directory.

By default, the `exclude_glob` option is set to ignore "node_modules" folders and those whose names start with ".", like ".git". If you specify your own glob patterns for folders to ignore, those will be overwritten by your patterns.

`no-tree` can be used to avoid a graphical file tree being created for a folder, either because it's irrelevant or because it's too big and you want separate trees for its subfolders. For the latter case, exclude a folder with `--no-tree` and get tree diagrams for its subfolders by passing them to `--extra-tree`.

`image-width` allows you to expand or contract the horizontal space available in the file tree images for directory names and contents strings. By default, these images are 500px wide. To make the image appear larger for readability or smaller to fit within a page, use `image-scale` with a scale factor value of perhaps 0.75 or 1.3. This will only affect how the image is displayed; its contents will simply be scaled.

`link-to` will make the directory paths displayed in headers work as links. The URL for the link will be formed by taking the argument to `--link-to` and appending the path of the directory being used as a header, relative to the current working directory. So, if you're linking to a Github repository, you want the current working directory to be at the root, where the .git directory is. IMPORTANT: for Github, you will need to use a url that looks like this: `https://github.com/you/yourproject/tree/your_branch_name/`; links without the tree and branch name segments will not work.

`signoff` defaults to true, meaning that the output file will end with a disclaimer that it's automatically generated. Specify `--no-signoff` to avoid this.

### Example:

```
npx bundle-md client server lib --exclude lib/unimportant --no-tree client --extra-tree client/next --no-signoff
```
