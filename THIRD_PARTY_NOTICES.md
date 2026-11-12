# Third-party notices

SEMbada includes or uses the components below. Each remains under its own licence. The full licence texts are in the files listed here and in the app under *Guide → About → Third-party licenses*.

| Component | Used for | Licence | Licence text |
|---|---|---|---|
| docx (Dolan Miu) | Word export | MIT | [`vendor/licenses/docx_LICENSE.txt`](vendor/licenses/docx_LICENSE.txt) |
| PptxGenJS (Brent Ely) | PowerPoint export | MIT | [`vendor/licenses/pptxgenjs_LICENSE.txt`](vendor/licenses/pptxgenjs_LICENSE.txt) |
| JSZip (Stuart Knightley and contributors) | ZIP and Office packaging | MIT (dual-licensed MIT or GPL-3.0; used under MIT) | [`vendor/licenses/jszip_LICENSE.markdown`](vendor/licenses/jszip_LICENSE.markdown) |
| SwiftLaTeX pdfTeX WebAssembly engine | Compiling papers and Beamer slides to PDF inside the app | AGPL-3.0 | [`vendor/swiftlatex/LICENSE_swiftlatex.txt`](vendor/swiftlatex/LICENSE_swiftlatex.txt); source code at <https://github.com/SwiftLaTeX/SwiftLaTeX> |
| TeX Live components bundled with the engine | Typesetting | pdfTeX: GPL-2.0 or later. LaTeX kernel and macro packages: LaTeX Project Public License 1.3c or the free licence stated in each file. Fonts: URW Nimbus Roman, Nimbus Sans, and Standard Symbols (GNU AGPL with font exception); Computer Modern and AMS Type 1 fonts (SIL Open Font License) | <https://www.tug.org/texlive/> |
| Neutralinojs | Windows and macOS desktop builds | MIT (and the licences of its own dependencies) | [`vendor/licenses/nl_license.txt`](vendor/licenses/nl_license.txt) |
| Plus Jakarta Sans (Tokotype) | Typeface for the interface and exported figures | SIL Open Font License 1.1 | [`fonts/OFL-PlusJakartaSans.txt`](fonts/OFL-PlusJakartaSans.txt) |
| Inter (Rasmus Andersson) | Typeface for the interface | SIL Open Font License 1.1 | <https://github.com/rsms/inter> |
| Example datasets from the R packages seminr, cSEM, and plspm | Bundled examples | GPL-3 | [`data/README.md`](data/README.md) |

The engine of the in-app LaTeX compiler runs in a separate Web Worker and communicates with the rest of SEMbada only by messages. Its unmodified source code is available from the SwiftLaTeX project linked above.
