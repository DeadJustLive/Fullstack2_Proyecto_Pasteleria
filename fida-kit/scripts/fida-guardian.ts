// @pca:start
// @id(fida_kit.scripts.fida_guardian)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (fida-guardian.ts))
// @pca:end
#!/usr/bin/env ts-node
/**
 * FIDA Guardian — AST Drift Detection Script
 *
 * Analyzes a FIDA module's structural integrity by comparing the current
 * AST (Abstract Syntax Tree) against a stored snapshot. Calculates an
 * impact score using semantic weights to determine if a commit should
 * be blocked.
 *
 * Usage:
 *   npx ts-node scripts/fida-guardian.ts ./path/to/module
 *
 * Exit codes:
 *   0 — Score < 60 (LOW or MEDIUM impact, commit allowed)
 *   1 — Score >= 60 (HIGH impact, commit blocked)
 *
 * Semantic Weight Table:
 *   Interface changes (exports, type signatures):  +50 per change
 *   Dependency changes (imports/exports):           +40 per change
 *   New/removed functions:                          +15 each
 *   Internal logic change (< 50 char diff):         +2
 *   Internal logic change (>= 50 char diff):        +10
 */

import { Project, SourceFile, SyntaxKind, Node } from "ts-morph";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SnapshotInterface {
  hash: string;
  props: string[];
  events: string[];
  exportedTypes: string[];
}

interface SnapshotDependencies {
  hash: string;
  external: string[];
  count: number;
}

interface SnapshotView {
  hash: string;
  internalFunctions: string[];
  stateVariables: string[];
  characterCount: number;
}

interface FidaSnapshot {
  _comment: string;
  module: string;
  version: number;
  timestamp: string;
  interface: SnapshotInterface;
  dependencies: SnapshotDependencies;
  view: SnapshotView;
}

interface ImpactDetail {
  category: string;
  description: string;
  score: number;
}

interface ImpactReport {
  module: string;
  totalScore: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  details: ImpactDetail[];
  isFirstRun: boolean;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const WEIGHT_INTERFACE_CHANGE = 50;
const WEIGHT_DEPENDENCY_CHANGE = 40;
const WEIGHT_FUNCTION_CHANGE = 15;
const WEIGHT_LOGIC_SMALL = 2;
const WEIGHT_LOGIC_LARGE = 10;
const THRESHOLD_LOGIC_CHARS = 50;
const THRESHOLD_BLOCK = 60;

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function stripWhitespace(text: string): string {
  return text.replace(/\s+/g, "");
}

function resolveModuleName(modulePath: string): string {
  return path.basename(path.resolve(modulePath));
}

/**
 * Finds the interface file for a given module.
 * Looks for I<ModuleName>.ts or IModuleName.ts patterns.
 */
function findInterfaceFile(modulePath: string, moduleName: string): string | null {
  const candidates = [
    path.join(modulePath, `I${moduleName}.ts`),
    path.join(modulePath, `I${moduleName}.tsx`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Finds the dependencies file for a given module.
 */
function findDependenciesFile(modulePath: string): string | null {
  const candidate = path.join(modulePath, "dependencies.ts");
  return fs.existsSync(candidate) ? candidate : null;
}

/**
 * Finds the view file for a given module.
 * Looks for <ModuleName>.view.tsx or <ModuleName>.view.ts patterns.
 */
function findViewFile(modulePath: string, moduleName: string): string | null {
  const candidates = [
    path.join(modulePath, `${moduleName}.view.tsx`),
    path.join(modulePath, `${moduleName}.view.ts`),
    path.join(modulePath, `${moduleName}.view.jsx`),
    path.join(modulePath, `${moduleName}.view.js`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// ─────────────────────────────────────────────
// AST Analysis Functions
// ─────────────────────────────────────────────

/**
 * Extracts interface information from the Interface file using ts-morph AST.
 */
function analyzeInterface(sourceFile: SourceFile): SnapshotInterface {
  const content = sourceFile.getFullText();
  const props: string[] = [];
  const events: string[] = [];
  const exportedTypes: string[] = [];

  // Extract all exported interfaces
  const interfaces = sourceFile.getInterfaces().filter((i) => i.isExported());
  for (const iface of interfaces) {
    const name = iface.getName();

    // Classify interface members
    for (const member of iface.getMembers()) {
      if (Node.isPropertySignature(member)) {
        const memberName = member.getName();
        const memberType = member.getType().getText(member);

        // Events are typically callback props (functions)
        if (memberType.includes("=>") || memberType.includes("Function")) {
          events.push(`${name}.${memberName}: ${memberType}`);
        } else {
          props.push(`${name}.${memberName}: ${memberType}`);
        }
      }
    }
  }

  // Extract exported type aliases
  const typeAliases = sourceFile.getTypeAliases().filter((t) => t.isExported());
  for (const typeAlias of typeAliases) {
    exportedTypes.push(`${typeAlias.getName()} = ${typeAlias.getType().getText(typeAlias)}`);
  }

  return {
    hash: hashContent(content),
    props,
    events,
    exportedTypes,
  };
}

/**
 * Extracts dependency information from the dependencies file using ts-morph AST.
 */
function analyzeDependencies(sourceFile: SourceFile): SnapshotDependencies {
  const content = sourceFile.getFullText();
  const external: string[] = [];

  // Extract all export declarations (re-exports)
  const exportDeclarations = sourceFile.getExportDeclarations();
  for (const decl of exportDeclarations) {
    const moduleSpecifier = decl.getModuleSpecifierValue();
    if (moduleSpecifier) {
      const namedExports = decl.getNamedExports().map((ne) => ne.getName());
      for (const exportName of namedExports) {
        external.push(`${exportName} from '${moduleSpecifier}'`);
      }
      // If it's a namespace export (export * from ...)
      if (namedExports.length === 0) {
        external.push(`* from '${moduleSpecifier}'`);
      }
    }
  }

  // Also check import declarations that are re-exported
  const importDeclarations = sourceFile.getImportDeclarations();
  for (const decl of importDeclarations) {
    const moduleSpecifier = decl.getModuleSpecifierValue();
    const namedImports = decl.getNamedImports().map((ni) => ni.getName());
    for (const importName of namedImports) {
      // Only track if not already covered by export declarations
      const signature = `${importName} from '${moduleSpecifier}'`;
      if (!external.includes(signature)) {
        external.push(signature);
      }
    }
  }

  return {
    hash: hashContent(content),
    external,
    count: external.length,
  };
}

/**
 * Extracts view information from the view file using ts-morph AST.
 */
function analyzeView(sourceFile: SourceFile): SnapshotView {
  const content = sourceFile.getFullText();
  const internalFunctions: string[] = [];
  const stateVariables: string[] = [];

  // Extract all function declarations and arrow function variables
  const functions = sourceFile.getFunctions();
  for (const fn of functions) {
    const name = fn.getName();
    if (name) {
      internalFunctions.push(name);
    }
  }

  // Extract variable statements that contain arrow functions or function expressions
  const variableStatements = sourceFile.getVariableStatements();
  for (const stmt of variableStatements) {
    for (const decl of stmt.getDeclarations()) {
      const name = decl.getName();
      const initializer = decl.getInitializer();

      if (initializer) {
        const kind = initializer.getKind();
        if (
          kind === SyntaxKind.ArrowFunction ||
          kind === SyntaxKind.FunctionExpression
        ) {
          internalFunctions.push(name);
        } else if (
          kind === SyntaxKind.CallExpression
        ) {
          // Detect hooks like useState, useRef, etc.
          const callText = initializer.getText();
          if (/^use[A-Z]/.test(callText)) {
            stateVariables.push(name);
          }
        }
      }
    }
  }

  // Strip whitespace for character count comparison
  const strippedContent = stripWhitespace(content);

  return {
    hash: hashContent(content),
    internalFunctions,
    stateVariables,
    characterCount: strippedContent.length,
  };
}

// ─────────────────────────────────────────────
// Impact Calculation
// ─────────────────────────────────────────────

function calculateImpact(
  previous: FidaSnapshot,
  current: FidaSnapshot
): ImpactDetail[] {
  const details: ImpactDetail[] = [];

  // === Interface changes ===
  if (previous.interface.hash !== current.interface.hash) {
    // Check for prop changes
    const prevProps = new Set(previous.interface.props);
    const currProps = new Set(current.interface.props);
    const addedProps = current.interface.props.filter((p) => !prevProps.has(p));
    const removedProps = previous.interface.props.filter((p) => !currProps.has(p));

    for (const prop of addedProps) {
      details.push({
        category: "Interface",
        description: `Prop añadido: ${prop}`,
        score: WEIGHT_INTERFACE_CHANGE,
      });
    }
    for (const prop of removedProps) {
      details.push({
        category: "Interface",
        description: `Prop eliminado: ${prop}`,
        score: WEIGHT_INTERFACE_CHANGE,
      });
    }

    // Check for event changes
    const prevEvents = new Set(previous.interface.events);
    const currEvents = new Set(current.interface.events);
    const addedEvents = current.interface.events.filter((e) => !prevEvents.has(e));
    const removedEvents = previous.interface.events.filter((e) => !currEvents.has(e));

    for (const event of addedEvents) {
      details.push({
        category: "Interface",
        description: `Evento añadido: ${event}`,
        score: WEIGHT_INTERFACE_CHANGE,
      });
    }
    for (const event of removedEvents) {
      details.push({
        category: "Interface",
        description: `Evento eliminado: ${event}`,
        score: WEIGHT_INTERFACE_CHANGE,
      });
    }

    // Check for exported type changes
    const prevTypes = new Set(previous.interface.exportedTypes);
    const currTypes = new Set(current.interface.exportedTypes);
    const addedTypes = current.interface.exportedTypes.filter((t) => !prevTypes.has(t));
    const removedTypes = previous.interface.exportedTypes.filter((t) => !currTypes.has(t));

    for (const t of addedTypes) {
      details.push({
        category: "Interface",
        description: `Tipo exportado añadido: ${t}`,
        score: WEIGHT_INTERFACE_CHANGE,
      });
    }
    for (const t of removedTypes) {
      details.push({
        category: "Interface",
        description: `Tipo exportado eliminado: ${t}`,
        score: WEIGHT_INTERFACE_CHANGE,
      });
    }
  }

  // === Dependency changes ===
  if (previous.dependencies.hash !== current.dependencies.hash) {
    const prevDeps = new Set(previous.dependencies.external);
    const currDeps = new Set(current.dependencies.external);
    const addedDeps = current.dependencies.external.filter((d) => !prevDeps.has(d));
    const removedDeps = previous.dependencies.external.filter((d) => !currDeps.has(d));

    for (const dep of addedDeps) {
      details.push({
        category: "Dependencies",
        description: `Dependencia añadida: ${dep}`,
        score: WEIGHT_DEPENDENCY_CHANGE,
      });
    }
    for (const dep of removedDeps) {
      details.push({
        category: "Dependencies",
        description: `Dependencia eliminada: ${dep}`,
        score: WEIGHT_DEPENDENCY_CHANGE,
      });
    }
  }

  // === View / function changes ===
  if (previous.view.hash !== current.view.hash) {
    const prevFns = new Set(previous.view.internalFunctions);
    const currFns = new Set(current.view.internalFunctions);
    const addedFns = current.view.internalFunctions.filter((f) => !prevFns.has(f));
    const removedFns = previous.view.internalFunctions.filter((f) => !currFns.has(f));

    for (const fn of addedFns) {
      details.push({
        category: "View",
        description: `Función añadida: ${fn}`,
        score: WEIGHT_FUNCTION_CHANGE,
      });
    }
    for (const fn of removedFns) {
      details.push({
        category: "View",
        description: `Función eliminada: ${fn}`,
        score: WEIGHT_FUNCTION_CHANGE,
      });
    }

    // Internal logic change (measured by character diff)
    const charDiff = Math.abs(
      current.view.characterCount - previous.view.characterCount
    );

    // Only score logic change if we haven't already scored function changes
    // or if there are no function-level changes but the hash still differs
    if (addedFns.length === 0 && removedFns.length === 0) {
      if (charDiff > 0) {
        const logicScore =
          charDiff < THRESHOLD_LOGIC_CHARS ? WEIGHT_LOGIC_SMALL : WEIGHT_LOGIC_LARGE;
        details.push({
          category: "View",
          description: `Cambio de lógica interna (${charDiff} chars diff)`,
          score: logicScore,
        });
      }
    } else if (charDiff >= THRESHOLD_LOGIC_CHARS) {
      // If there are function changes AND significant char diff, add logic score too
      details.push({
        category: "View",
        description: `Cambio de lógica interna adicional (${charDiff} chars diff)`,
        score: WEIGHT_LOGIC_LARGE,
      });
    }
  }

  return details;
}

function determineLevel(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score >= THRESHOLD_BLOCK) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

// ─────────────────────────────────────────────
// Snapshot I/O
// ─────────────────────────────────────────────

function getSnapshotPath(modulePath: string): string {
  return path.join(modulePath, "docs", ".snapshot.json");
}

function loadSnapshot(snapshotPath: string): FidaSnapshot | null {
  try {
    if (!fs.existsSync(snapshotPath)) return null;
    const content = fs.readFileSync(snapshotPath, "utf-8");
    return JSON.parse(content) as FidaSnapshot;
  } catch {
    return null;
  }
}

function saveSnapshot(snapshotPath: string, snapshot: FidaSnapshot): void {
  const dir = path.dirname(snapshotPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf-8");
}

// ─────────────────────────────────────────────
// Report Output
// ─────────────────────────────────────────────

function levelEmoji(level: "LOW" | "MEDIUM" | "HIGH"): string {
  switch (level) {
    case "LOW":
      return "🟢";
    case "MEDIUM":
      return "🟡";
    case "HIGH":
      return "🔴";
  }
}

function printReport(report: ImpactReport): void {
  const emoji = levelEmoji(report.level);
  const border = "═".repeat(56);
  const thinBorder = "─".repeat(56);

  console.log("");
  console.log(`╔${border}╗`);
  console.log(`║  FIDA Guardian — Reporte de Impacto${" ".repeat(20)}║`);
  console.log(`╠${border}╣`);
  console.log(`║  Módulo:     ${report.module.padEnd(42)}║`);

  if (report.isFirstRun) {
    console.log(`║  Estado:     Primer análisis — snapshot generado${" ".repeat(7)}║`);
    console.log(`║  Score:      0  🟢 LOW (baseline)${" ".repeat(22)}║`);
  } else {
    const scoreStr = `${report.totalScore}  ${emoji} ${report.level}`;
    console.log(`║  Score:      ${scoreStr.padEnd(42)}║`);
  }

  console.log(`║${" ".repeat(56)}║`);

  if (!report.isFirstRun && report.details.length > 0) {
    console.log(`║  Detalles:${" ".repeat(45)}║`);
    for (const detail of report.details) {
      const line = `    • ${detail.category}: +${detail.score} (${detail.description})`;
      // Truncate if too long for the box
      const truncated = line.length > 54 ? line.slice(0, 51) + "..." : line;
      console.log(`║${truncated.padEnd(56)}║`);
    }
    console.log(`║${" ".repeat(56)}║`);
  }

  if (!report.isFirstRun && report.level === "HIGH") {
    console.log(
      `║  ❌ BLOQUEADO — Revise decisions.md antes de commit${" ".repeat(4)}║`
    );
  } else if (!report.isFirstRun && report.level === "MEDIUM") {
    console.log(
      `║  ⚠️  ADVERTENCIA — Considere documentar los cambios${" ".repeat(2)}║`
    );
  } else if (!report.isFirstRun) {
    console.log(
      `║  ✅ Sin problemas — Cambios dentro del rango normal${" ".repeat(3)}║`
    );
  }

  console.log(`╚${border}╝`);
  console.log("");
}

// ─────────────────────────────────────────────
// Main Entry Point
// ─────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Uso: npx ts-node fida-guardian.ts <ruta-al-modulo>");
    console.error("");
    console.error("Ejemplo:");
    console.error("  npx ts-node fida-guardian.ts ./src/modules/HomeView");
    process.exit(2);
  }

  const modulePath = path.resolve(args[0]);

  // Validate module directory exists
  if (!fs.existsSync(modulePath)) {
    console.error(`❌ Error: El directorio del módulo no existe: ${modulePath}`);
    process.exit(2);
  }

  if (!fs.statSync(modulePath).isDirectory()) {
    console.error(`❌ Error: La ruta no es un directorio: ${modulePath}`);
    process.exit(2);
  }

  const moduleName = resolveModuleName(modulePath);

  // Initialize ts-morph project
  const project = new Project({
    compilerOptions: {
      allowJs: true,
      jsx: 1, // JsxEmit.Preserve
      strict: false,
      noEmit: true,
      skipLibCheck: true,
    },
    skipAddingFilesFromTsConfig: true,
  });

  // ── Locate module files ──
  const interfaceFilePath = findInterfaceFile(modulePath, moduleName);
  const dependenciesFilePath = findDependenciesFile(modulePath);
  const viewFilePath = findViewFile(modulePath, moduleName);

  // At least one FIDA file must exist
  if (!interfaceFilePath && !dependenciesFilePath && !viewFilePath) {
    console.error(`❌ Error: No se encontraron archivos FIDA en: ${modulePath}`);
    console.error("  Se esperaba al menos uno de:");
    console.error(`    - I${moduleName}.ts    (Interface)`);
    console.error(`    - dependencies.ts       (Dependencies)`);
    console.error(`    - ${moduleName}.view.tsx (View)`);
    process.exit(2);
  }

  // ── Analyze current state ──
  let interfaceData: SnapshotInterface = {
    hash: "",
    props: [],
    events: [],
    exportedTypes: [],
  };

  let dependenciesData: SnapshotDependencies = {
    hash: "",
    external: [],
    count: 0,
  };

  let viewData: SnapshotView = {
    hash: "",
    internalFunctions: [],
    stateVariables: [],
    characterCount: 0,
  };

  if (interfaceFilePath) {
    try {
      const sourceFile = project.addSourceFileAtPath(interfaceFilePath);
      interfaceData = analyzeInterface(sourceFile);
    } catch (err) {
      console.warn(`⚠️  Advertencia: No se pudo analizar el archivo Interface: ${err}`);
    }
  }

  if (dependenciesFilePath) {
    try {
      const sourceFile = project.addSourceFileAtPath(dependenciesFilePath);
      dependenciesData = analyzeDependencies(sourceFile);
    } catch (err) {
      console.warn(`⚠️  Advertencia: No se pudo analizar el archivo Dependencies: ${err}`);
    }
  }

  if (viewFilePath) {
    try {
      const sourceFile = project.addSourceFileAtPath(viewFilePath);
      viewData = analyzeView(sourceFile);
    } catch (err) {
      console.warn(`⚠️  Advertencia: No se pudo analizar el archivo View: ${err}`);
    }
  }

  // ── Build current snapshot ──
  const currentSnapshot: FidaSnapshot = {
    _comment:
      "FIDA Structural Snapshot — Auto-generated by fida-guardian. DO NOT edit manually.",
    module: moduleName,
    version: 1,
    timestamp: new Date().toISOString(),
    interface: interfaceData,
    dependencies: dependenciesData,
    view: viewData,
  };

  // ── Load previous snapshot ──
  const snapshotPath = getSnapshotPath(modulePath);
  const previousSnapshot = loadSnapshot(snapshotPath);

  // ── First run: generate baseline ──
  if (!previousSnapshot) {
    saveSnapshot(snapshotPath, currentSnapshot);

    const report: ImpactReport = {
      module: moduleName,
      totalScore: 0,
      level: "LOW",
      details: [],
      isFirstRun: true,
    };

    printReport(report);
    console.log(`📸 Snapshot inicial guardado en: ${snapshotPath}`);
    process.exit(0);
  }

  // ── Calculate impact ──
  const details = calculateImpact(previousSnapshot, currentSnapshot);
  const totalScore = details.reduce((sum, d) => sum + d.score, 0);
  const level = determineLevel(totalScore);

  const report: ImpactReport = {
    module: moduleName,
    totalScore,
    level,
    details,
    isFirstRun: false,
  };

  printReport(report);

  // ── Update snapshot ──
  currentSnapshot.version = (previousSnapshot.version || 0) + 1;
  saveSnapshot(snapshotPath, currentSnapshot);
  console.log(`📸 Snapshot actualizado (v${currentSnapshot.version})`);

  // ── Exit based on impact ──
  if (level === "HIGH") {
    console.error(
      `\n❌ Impacto ${level} (score: ${totalScore}). Commit bloqueado.`
    );
    console.error(
      "   Documente los cambios en docs/decisions.md antes de volver a intentar.\n"
    );
    process.exit(1);
  } else if (level === "MEDIUM") {
    process.stderr.write(
      `\n⚠️  Impacto ${level} (score: ${totalScore}). Considere documentar los cambios.\n\n`
    );
    process.exit(0);
  } else {
    process.exit(0);
  }
}

// Run
main();
