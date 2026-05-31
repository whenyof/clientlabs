import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const PUBLIC = path.resolve('public')
const APP = path.resolve('app')

async function fromSvg(
  svgPath: string,
  outPath: string,
  width: number,
  height: number,
) {
  await sharp(fs.readFileSync(svgPath), { density: 384 })
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outPath)
  console.log(`✓ ${outPath}`)
}

async function main() {
  await fromSvg(`${PUBLIC}/clientlabs-icon-solid-green.svg`, `${APP}/icon.png`, 32, 32)
  await fromSvg(`${PUBLIC}/clientlabs-icon-solid-green.svg`, `${APP}/icon-96.png`, 96, 96)
  await fromSvg(`${PUBLIC}/clientlabs-avatar-green.svg`, `${APP}/icon-192.png`, 192, 192)
  await fromSvg(`${PUBLIC}/clientlabs-avatar-green.svg`, `${APP}/icon-512.png`, 512, 512)
  await fromSvg(`${PUBLIC}/clientlabs-avatar-green.svg`, `${APP}/apple-icon.png`, 180, 180)
  await fromSvg(`${PUBLIC}/clientlabs-icon-solid-green.svg`, `${PUBLIC}/favicon.png`, 48, 48)
  console.log('✓ Todos los assets generados')
}

main().catch(console.error)
