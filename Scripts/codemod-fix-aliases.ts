import { Project } from "ts-morph";

const tsConfigPath = process.argv[2];
if (!tsConfigPath) {
  console.error("Usage: ts-node codemod-fix-aliases.ts <tsconfig-path>");
  process.exit(1);
}

const project = new Project({ tsConfigFilePath: tsConfigPath });
for (const sf of project.getSourceFiles()) {
  for (const d of sf.getImportDeclarations()) {
    const s = d.getModuleSpecifierValue();
    if (s.startsWith("@/")) {
      d.setModuleSpecifier(s.replace(/^@\//, "@web/"));
    }
  }
}
project.saveSync();
console.log("Codemod complete.");
