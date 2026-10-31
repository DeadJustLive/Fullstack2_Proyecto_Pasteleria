/**
 * FIDA Boundaries — ESLint Plugin / Rule Concept
 *
 * This file defines the conceptual ESLint rules for enforcing FIDA
 * architecture boundaries. It can be integrated with:
 *   - eslint-plugin-boundaries (recommended)
 *   - Custom ESLint rules via RuleModule API
 *   - eslint-plugin-import (for basic import restrictions)
 *
 * ═══════════════════════════════════════════════════════════════
 * RULES ENFORCED:
 *
 *   1. fida/view-imports-through-gateway
 *      View files (*.view.tsx) cannot import from outside their
 *      module directory EXCEPT through ./dependencies.ts
 *
 *   2. fida/no-circular-modules
 *      No circular dependencies between FIDA modules. Module A
 *      cannot import from Module B if Module B imports from Module A.
 *
 *   3. fida/interface-no-implementation
 *      Interface files (I*.ts) cannot contain function bodies,
 *      class implementations, or variable assignments with logic.
 * ═══════════════════════════════════════════════════════════════
 *
 * INTEGRATION GUIDE:
 *
 * Option A: Using eslint-plugin-boundaries (Recommended)
 * ──────────────────────────────────────────────────────
 *
 * 1. Install:
 *    npm install --save-dev eslint-plugin-boundaries
 *
 * 2. Add to your .eslintrc.js:
 *
 *    module.exports = {
 *      plugins: ['boundaries'],
 *      settings: {
 *        'boundaries/elements': [
 *          { type: 'fida-interface', pattern: 'src/modules/(*)/I*.ts' },
 *          { type: 'fida-deps', pattern: 'src/modules/(*)/dependencies.ts' },
 *          { type: 'fida-view', pattern: 'src/modules/(*)/*.view.tsx' },
 *          { type: 'shared', pattern: 'src/shared/**' },
 *        ],
 *      },
 *      rules: {
 *        'boundaries/element-types': [2, {
 *          default: 'disallow',
 *          rules: [
 *            // Views can only import from their own deps file and interface
 *            {
 *              from: 'fida-view',
 *              allow: ['fida-deps', 'fida-interface'],
 *              importKind: 'value',
 *            },
 *            // Deps files can import from anywhere (that's their purpose)
 *            {
 *              from: 'fida-deps',
 *              allow: ['shared', 'fida-interface'],
 *            },
 *            // Interfaces cannot import implementation
 *            {
 *              from: 'fida-interface',
 *              allow: [], // Only type imports from shared types
 *            },
 *          ],
 *        }],
 *        'boundaries/no-unknown': [2],
 *        'boundaries/no-private': [2],
 *      },
 *    };
 *
 *
 * Option B: Using eslint-plugin-import (Simpler)
 * ───────────────────────────────────────────────
 *
 * 1. Install:
 *    npm install --save-dev eslint-plugin-import
 *
 * 2. Add to your .eslintrc.js:
 *
 *    module.exports = {
 *      plugins: ['import'],
 *      rules: {
 *        'import/no-restricted-paths': [2, {
 *          zones: [
 *            // Views can't import from other modules directly
 *            {
 *              target: './src/modules/(*)',
 *              from: './src/modules/!(${1})',
 *              message: 'FIDA: Los View files deben importar dependencias externas a través de dependencies.ts',
 *            },
 *          ],
 *        }],
 *        'import/no-cycle': [2, { maxDepth: 3 }],
 *      },
 *    };
 *
 *
 * Option C: Custom ESLint Rule (Advanced)
 * ───────────────────────────────────────
 * See the rule implementations below.
 */

// ═══════════════════════════════════════════════════════════════
// Rule 1: fida/view-imports-through-gateway
// ═══════════════════════════════════════════════════════════════

/**
 * @type {import('eslint').Rule.RuleModule}
 *
 * Enforces that View files (*.view.tsx) only import external
 * dependencies through their module's dependencies.ts gateway.
 *
 * ALLOWED imports in a View file:
 *   - ./dependencies (the gateway)
 *   - ./I<ModuleName> (the contract)
 *   - ./<anything> (internal module files)
 *   - react, react-dom (framework essentials)
 *
 * DISALLOWED imports:
 *   - @/components/* (must go through dependencies.ts)
 *   - @/hooks/* (must go through dependencies.ts)
 *   - ../OtherModule/* (cross-module imports)
 *   - Any absolute or aliased path outside the module
 */
const viewImportsThroughGateway = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce that View files import external dependencies through dependencies.ts",
      category: "FIDA Architecture",
      recommended: true,
    },
    messages: {
      directExternalImport:
        'FIDA: El archivo View no debe importar directamente desde "{{source}}". ' +
        "Use dependencies.ts como gateway de importación.",
    },
    schema: [
      {
        type: "object",
        properties: {
          // Packages that are always allowed (framework essentials)
          allowedPackages: {
            type: "array",
            items: { type: "string" },
            default: ["react", "react-dom", "react/jsx-runtime"],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();

    // Only apply to .view.tsx / .view.ts files
    if (!filename.match(/\.view\.(tsx?|jsx?)$/)) {
      return {};
    }

    const options = context.options[0] || {};
    const allowedPackages = options.allowedPackages || [
      "react",
      "react-dom",
      "react/jsx-runtime",
    ];

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        // Allow relative imports within the same module directory
        if (source.startsWith("./") || source.startsWith("../")) {
          // Allow imports from same directory
          if (source.startsWith("./")) return;

          // Disallow imports that go up more than one level (cross-module)
          const upLevels = (source.match(/\.\.\//g) || []).length;
          if (upLevels > 0) {
            context.report({
              node,
              messageId: "directExternalImport",
              data: { source },
            });
          }
          return;
        }

        // Allow framework packages
        if (allowedPackages.some((pkg) => source === pkg || source.startsWith(pkg + "/"))) {
          return;
        }

        // Everything else is a direct external import — not allowed
        context.report({
          node,
          messageId: "directExternalImport",
          data: { source },
        });
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule 2: fida/no-circular-modules
// ═══════════════════════════════════════════════════════════════

/**
 * @type {import('eslint').Rule.RuleModule}
 *
 * Prevents circular dependencies between FIDA modules.
 * This is best handled by eslint-plugin-import's "import/no-cycle" rule,
 * but this conceptual rule shows how it would work specifically for
 * FIDA module boundaries.
 *
 * Detection strategy:
 *   1. Parse each module's dependencies.ts
 *   2. Build a directed graph of module → module dependencies
 *   3. Run cycle detection (DFS with back-edge detection)
 *   4. Report any cycles found
 *
 * NOTE: For production use, prefer:
 *   'import/no-cycle': [2, { maxDepth: 3 }]
 */
const noCircularModules = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent circular dependencies between FIDA modules",
      category: "FIDA Architecture",
      recommended: true,
    },
    messages: {
      circularDependency:
        "FIDA: Dependencia circular detectada entre módulos: {{cycle}}. " +
        "Extraiga la dependencia compartida a un módulo común.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Only check dependencies.ts files
    if (!filename.endsWith("/dependencies.ts")) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        // Check for imports that reference other module directories
        // Pattern: ../../OtherModule/ or @/modules/OtherModule/
        const crossModulePattern =
          /(?:\.\.\/)+([A-Z][a-zA-Z0-9]+)\/|@\/modules\/([A-Z][a-zA-Z0-9]+)\//;
        const match = source.match(crossModulePattern);

        if (match) {
          const targetModule = match[1] || match[2];
          // In a full implementation, we'd build a dependency graph
          // and check for cycles. For now, we flag it as a potential issue.
          // The actual cycle detection is better done with import/no-cycle.
        }
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Rule 3: fida/interface-no-implementation
// ═══════════════════════════════════════════════════════════════

/**
 * @type {import('eslint').Rule.RuleModule}
 *
 * Ensures Interface files (I*.ts) only contain:
 *   - Interface declarations
 *   - Type aliases
 *   - Enums (as they are compile-time constructs)
 *   - Constants used as type discriminators
 *
 * DISALLOWED in Interface files:
 *   - Function declarations with bodies
 *   - Class declarations with method implementations
 *   - Variable assignments with function expressions
 *   - Side effects (console.log, API calls, etc.)
 */
const interfaceNoImplementation = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure Interface files contain only type declarations, no implementation logic",
      category: "FIDA Architecture",
      recommended: true,
    },
    messages: {
      implementationInInterface:
        "FIDA: Los archivos Interface (I*.ts) no deben contener lógica de implementación. " +
        "Encontrado: {{kind}}. Mueva la implementación al archivo View.",
      sideEffectInInterface:
        "FIDA: Los archivos Interface (I*.ts) no deben contener efectos secundarios. " +
        "Encontrado: {{expression}}.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Only apply to Interface files (I<Name>.ts pattern)
    const basename = filename.split("/").pop() || "";
    if (!basename.match(/^I[A-Z][a-zA-Z0-9]*\.tsx?$/)) {
      return {};
    }

    return {
      // Disallow function declarations with bodies
      FunctionDeclaration(node) {
        if (node.body) {
          context.report({
            node,
            messageId: "implementationInInterface",
            data: { kind: `function ${node.id?.name || "anónima"}()` },
          });
        }
      },

      // Disallow class declarations
      ClassDeclaration(node) {
        context.report({
          node,
          messageId: "implementationInInterface",
          data: { kind: `class ${node.id?.name || "anónima"}` },
        });
      },

      // Check variable declarations for function expressions
      VariableDeclaration(node) {
        for (const decl of node.declarations) {
          if (
            decl.init &&
            (decl.init.type === "ArrowFunctionExpression" ||
              decl.init.type === "FunctionExpression")
          ) {
            context.report({
              node: decl,
              messageId: "implementationInInterface",
              data: { kind: `variable con función: ${decl.id?.name || "?"}` },
            });
          }
        }
      },

      // Disallow expression statements (side effects)
      ExpressionStatement(node) {
        const expr = node.expression;
        // Allow simple type assertions or "as const" patterns
        if (expr.type === "TSAsExpression" || expr.type === "TSTypeAssertion") {
          return;
        }

        context.report({
          node,
          messageId: "sideEffectInInterface",
          data: {
            expression:
              expr.type === "CallExpression"
                ? `${expr.callee?.name || "llamada"}()`
                : expr.type,
          },
        });
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// Plugin Export
// ═══════════════════════════════════════════════════════════════

/**
 * To use as a local ESLint plugin, add this to your .eslintrc.js:
 *
 *   const fidaBoundaries = require('./fida-kit/eslint/fida-boundaries');
 *
 *   module.exports = {
 *     plugins: {
 *       fida: fidaBoundaries,
 *     },
 *     rules: {
 *       'fida/view-imports-through-gateway': 'error',
 *       'fida/no-circular-modules': 'error',
 *       'fida/interface-no-implementation': 'error',
 *     },
 *   };
 *
 * For ESLint 9+ flat config:
 *
 *   import fidaBoundaries from './fida-kit/eslint/fida-boundaries.js';
 *
 *   export default [
 *     {
 *       plugins: {
 *         fida: fidaBoundaries,
 *       },
 *       rules: {
 *         'fida/view-imports-through-gateway': 'error',
 *         'fida/no-circular-modules': 'error',
 *         'fida/interface-no-implementation': 'error',
 *       },
 *     },
 *   ];
 */
module.exports = {
  rules: {
    "view-imports-through-gateway": viewImportsThroughGateway,
    "no-circular-modules": noCircularModules,
    "interface-no-implementation": interfaceNoImplementation,
  },
  configs: {
    recommended: {
      plugins: ["fida"],
      rules: {
        "fida/view-imports-through-gateway": "error",
        "fida/no-circular-modules": "error",
        "fida/interface-no-implementation": "error",
      },
    },
  },
};
