#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const defaultDevBaseUrl = 'http://localhost:8080';
const localConfiguredBaseUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL;
const prodConfiguredBaseUrl = process.env.NEXT_PUBLIC_API_URL_PROD;

const fallbackByEnvironment =
  process.env.NODE_ENV === 'production'
    ? prodConfiguredBaseUrl ?? localConfiguredBaseUrl ?? defaultDevBaseUrl
    : localConfiguredBaseUrl ?? prodConfiguredBaseUrl ?? defaultDevBaseUrl;

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? fallbackByEnvironment;
const specUrl = `${baseUrl.replace(/\/?$/,'')}/docs/api-docs`;
const specPath = resolve('.openapi/schema.json');

async function main() {
  console.log(`Fetching OpenAPI spec from ${specUrl}`);
  const response = await fetch(specUrl);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}\n${text}`);
  }

  const spec = await response.text();
  mkdirSync(dirname(specPath), { recursive: true });
  writeFileSync(specPath, spec, 'utf8');
  console.log(`Saved spec to ${specPath}`);

  const cmd = [
    'npx',
    'openapi-typescript-codegen',
    '--input',
    specPath,
    '--output',
    'src/lib/api',
    '--client',
    'fetch',
    '--useOptions',
    '--useUnionTypes',
    '--exportSchemas',
    'true',
    '--indent',
    '2'
  ];

  console.log('Generating API client...');
  execSync(cmd.join(' '), { stdio: 'inherit' });
  console.log('API client generated in src/lib/api');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
