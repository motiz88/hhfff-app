import YAML from "js-yaml";
import fs from "fs";
import path from "path";
import * as t from "babel-types";
import generate from "babel-generator";
import deepMap from "deep-map";
import traverse from "babel-traverse";
import moment from "moment";
import remark from "remark";
import stripMarkdown from "strip-markdown";
import matches from "string-matches";
import imageSize from "image-size";
import template from "babel-template";
import { html, escape, raw } from "es6-string-html-template";
import { get, has } from "dot-prop";
import url from "url";
import datauri from "datauri";

const year = 2017;

const templateRequire = template(
  `
  require(PATH);
`
);

const templateRequireImage = template(
  `
  ({
    source: require(PATH),
    metadata: METADATA
  })
`
);

async function writeData(filename, data) {
  const dataAst = t.valueToNode(data);
  const ast = t.program([t.exportDefaultDeclaration(dataAst)]);
  const fspath = path;
  traverse(ast, {
    StringLiteral(path) {
      const value = path.node.value;
      const requireMatch = value.trim().match(/^require\((.+?)\)$/);
      if (requireMatch) {
        const filePath =
          "." + fspath.sep + fspath.join("data", requireMatch[1]);
        try {
          const metadata = imageSize(fspath.resolve(__dirname, "..", filePath));
          if (metadata) {
            path.replaceWith(
              templateRequireImage({
                PATH: t.stringLiteral(filePath),
                METADATA: t.valueToNode({
                  ...metadata,
                  filename: fspath.basename(filePath)
                })
              }).expression
            );
          } else {
            path.replaceWith(
              templateRequire({ PATH: t.stringLiteral(filePath) }).expression
            );
          }
        } catch (e) {
          console.error("Error processing required asset", filePath);
          throw e;
        }
      }
    }
  });
  const { code } = generate(ast);
  await fs.writeFile(filename, code);
}

const Films = YAML.safeLoad(
  fs.readFileSync(path.resolve(__dirname, "../data/films.yml"), "utf8")
);
const Sponsors = YAML.safeLoad(
  fs.readFileSync(path.resolve(__dirname, "../data/sponsors.yml"), "utf8")
);

const markdownStripper = remark().use(stripMarkdown);

for (const filmId of Object.keys(Films)) {
  const film = Films[filmId];
  const date = moment(film.date, "D MMM").year(year);
  const startTime = moment(film.time.start, "h:mma");

  film.exactStartTime = date
    .set({
      hour: startTime.hour(),
      minute: startTime.minute(),
      second: startTime.second()
    })
    .toISOString();

  if (film.running_time && film.running_time.endsWith("mins")) {
    film.approxEndTime = moment(film.exactStartTime)
      .add(
        matches(film.running_time, /\d+/g).map(Number).reduce((a, b) => a + b),
        "minutes"
      )
      .toISOString();
  }
  film.descriptionPlain = String(markdownStripper.processSync(film.description))
    .replace(/\\\*/g, "*")
    .trim();
}
const FilmsIndex = {
  byStartTime: Object.keys(Films).sort((a, b) =>
    Films[a].exactStartTime.localeCompare(Films[b].exactStartTime)
  )
};
const data = {
  Films,
  FilmsIndex,
  Sponsors
};

writeData(path.resolve(__dirname, "../data.generated.js"), data).catch(e => {
  console.error(e.stack || e);
  process.exit(64);
});

fs.writeFileSync(
  "docs/films.html",
  html`
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="films.css">
  </head>
  <body>
  ${raw(data.FilmsIndex.byStartTime
      .map(filmId => data.Films[filmId])
      .map(film => {
        function formatValue(value, fields = typeof value === "object" && Object.keys(value)) {
          if (typeof value === "object") {
            return html`
              <table>
                ${fields.map(key => formatField(value, key))}
              </table>
            `;
          }
          if (typeof value === "string") {
            const requireMatch = value.trim().match(/^require\((.+?)\)$/);
            if (requireMatch) {
              return html`<img src="${datauri.sync(path.resolve(__dirname, "../data", requireMatch[1]))}">`;
            }
            const asUrl = url.parse(value);
            if (asUrl.protocol) {
              return html`<a href="${value}" target="_blank">${value}</a>`;
            }
          }
          return value;
        }
        function formatField(object, key) {
          let label = key;
          if (Array.isArray(key)) {
            [key, label] = key;
          }
          return has(object, key) ? html`
            <tr class="field">
              <td class="label label-${key.replace(/\./g, "-")}">${label}</td>
              <td class="value value-${key.replace(/\./g, "-")}">${formatValue(get(object, key))}</td>
            </tr>
           ` : "";
        }
        return html`
          <article>
            <h1 style="background-color: ${film.colors.highlight}">${film.title}</h1>
            ${formatValue(film, [
          "title",
          "director",
          "year",
          "country",
          "certificate",
          "running_time",
          "date",
          "venue",
          "time.start",
          "trailer",
          ["descriptionPlain", "description"],
          "images"
        ])}
          </article>
        `;
      })
      .join("\n"))}
    </body>`
);
