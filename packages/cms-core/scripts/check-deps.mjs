#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function checkSpecifier(specifier, file, packageRoot) {
  if (
    specifier.startsWith('@portfolio/') ||
    (specifier.startsWith('@parker2808/') && !specifier.startsWith('@parker2808/cms-core/')) ||
    specifier.startsWith('@/') ||
    specifier.startsWith('apps/') ||
    specifier.startsWith('packages/') ||
    specifier.startsWith('file:')
  ) {
    return `${file}: host or external-package import ${specifier}`;
  }
  if (specifier.startsWith('.')) {
    const destination = relative(packageRoot, resolve(dirname(file), specifier));
    if (destination === '..' || destination.startsWith(`..${sep}`) || isAbsolute(destination)) {
      return `${file}: import escapes the package (${specifier})`;
    }
  }
  return null;
}

export function scanSource(source, file, packageRoot) {
  const syntax = /\.[cm]?tsx?$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, syntax);
  const failures = [];
  function visit(node) {
    let argument;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      argument = node.moduleSpecifier;
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      argument = node.moduleReference.expression;
    } else if (ts.isImportTypeNode(node)) {
      argument = node.argument.literal;
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      argument = node.arguments[0];
    }
    if (argument && ts.isStringLiteralLike(argument)) {
      const failure = checkSpecifier(argument.text, file, packageRoot);
      if (failure) failures.push(failure);
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return failures;
}

export function checkDependencies(packageRoot = root) {
  const failures = [];
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  for (const section of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    for (const [name, version] of Object.entries(manifest[section] ?? {})) {
      if (
        name.startsWith('@portfolio/') ||
        (name.startsWith('@parker2808/') && name !== manifest.name) ||
        version.startsWith('workspace:') ||
        version.startsWith('link:') ||
        version.startsWith('file:')
      ) {
        failures.push(`${section}: package-specific dependency ${name}`);
      }
    }
  }
  const pending = ['src', 'test', 'scripts'].map((directory) => join(packageRoot, directory));
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) pending.push(file);
      else if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) {
        failures.push(...scanSource(readFileSync(file, 'utf8'), file, packageRoot));
      }
    }
  }
  return failures;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const failures = checkDependencies();
  if (failures.length) {
    console.error(`cms-core dependency boundary failed:\n${failures.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('cms-core dependency boundary passed');
  }
}
