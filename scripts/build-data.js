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
        const filePath = "." +
          fspath.sep +
          fspath.join("data", requireMatch[1]);
        try {
          const metadata = imageSize(fspath.resolve(__dirname, "..", filePath));
          if (metadata) {
              path.replaceWith(
                templateRequireImage({
                  PATH: t.stringLiteral(filePath),
                  METADATA: t.valueToNode(metadata)
                }).expression
              );
          } else {
            path.replaceWith(
              templateRequire({ PATH: t.stringLiteral(filePath) }).expression
            );
          }
        } catch (e) {
          console.error('Error processing required asset', filePath);
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
  film.descriptionPlain = String(
    markdownStripper.processSync(film.description)
  ).replace(/\\\*/g, "*");
}
const FilmsIndex = {
  byStartTime: Object.keys(Films).sort((a, b) =>
    Films[a].exactStartTime.localeCompare(Films[b].exactStartTime))
};
const data = {
  Films,
  FilmsIndex
};

writeData(path.resolve(__dirname, "../data.generated.js"), data).catch(e => {
  console.error(e.stack || e);
  process.exit(64);
});
