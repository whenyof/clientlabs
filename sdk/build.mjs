/**
 * ClientLabs SDK — Build Script
 *
 * Uses esbuild to bundle SDK source into a single IIFE file.
 * Output: public/sdk/clientlabs.js (minified) + clientlabs.js.map
 *
 * Run: node sdk/build.mjs
 */

import { build } from 'esbuild'
import { readFileSync } from 'fs'

const result = await build({
    entryPoints: ['sdk/src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    format: 'iife',
    globalName: 'clientlabs',
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    outfile: 'public/sdk/clientlabs.js',
    platform: 'browser',
    metafile: true,
    legalComments: 'none',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
})

// Print size info
const outFile = 'public/sdk/clientlabs.js'
const bytes = readFileSync(outFile).length
const kb = (bytes / 1024).toFixed(1)
console.log(`✅ Built ${outFile} — ${kb} KB minified`)

// Print breakdown
const outputs = result.metafile?.outputs || {}
for (const [file, info] of Object.entries(outputs)) {
    if (!file.endsWith('.map')) {
        console.log(`   ${file}: ${(info.bytes / 1024).toFixed(1)} KB`)
    }
}
