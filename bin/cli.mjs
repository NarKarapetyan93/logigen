#!/usr/bin/env node
import { program } from 'commander';
import { generateCode } from '../src';

program
  .version('1.0.0')
  .command('logigen <type>')
  .description('Generate code')
  .option('-n, --name <name>', 'Name of the item to generate')
  .option('-p, --path <path>', 'Path for generation', '.')
  .option('-f, --framework <framework>', 'Framework to use', 'react')
  .option('-t, --typescript', 'Use TypeScript', false)
  .action((type, options) => {
    generateCode(type, options);
  });

program.parse(process.argv);
