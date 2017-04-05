import YAML from "js-yaml";
import fs from "fs";
import path from "path";
import * as t from "babel-types";
import generate from "babel-generator";
import deepMap from "deep-map";
import traverse from "babel-traverse";

async function writeData(filename, data) {
  const dataAst = t.valueToNode(data);
  const ast = t.program([t.exportDefaultDeclaration(dataAst)]);
  const fspath = path;
  traverse(ast, {
    StringLiteral(path) {
      const value = path.node.value;
      const requireMatch = value.trim().match(/^require\((.+?)\)$/);
      if (requireMatch) {
        path.replaceWith(
          t.callExpression(t.identifier("require"), [
            t.stringLiteral(
              "." + fspath.sep + fspath.join("data", requireMatch[1])
            )
          ])
        );
      }
    }
  });
  const { code } = generate(ast);
  await fs.writeFile(filename, code);
}

const Films = YAML.safeLoad(
  fs.readFileSync(path.resolve(__dirname, "../data/films.yml"), "utf8")
);

// for (let i = 1; i <= 9; ++i) {
//   for (const key of Object.keys(Films)) {
//     Films[key + i] = Films[key];
//   }
// }
const data = {
  Films
};

writeData(path.resolve(__dirname, "../data.generated.js"), data).catch(e => {
  console.error(e.stack || e);
  process.exit(64);
});
