/**
 * seedProductImages.js
 * 
 * Seeds demo images for products that have no image assigned.
 * - Downloads high-quality placeholder images from picsum.photos
 * - Resizes & converts to 1200x1200 WebP (same as imageProcessor middleware)
 * - Saves to uploads/products/
 * - Updates only products where image IS NULL
 * 
 * Usage: node seeders/seedProductImages.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const fs   = require('fs');
const https = require('https');
const sharp = require('sharp');
const { sequelize, Product } = require('../models');

// ─── Config ─────────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Picsum photo IDs grouped by category keyword in product name
// Each ID gives a deterministic, high-quality real photograph
const IMAGE_MAP = [
  // Electronics
  { keywords: ['iphone', 'samsung', 'smartphone', 'phone'],         picsumId: 48  },
  { keywords: ['macbook', 'laptop', 'dell', 'computer'],            picsumId: 119 },
  { keywords: ['earbuds', 'headphone', 'speaker', 'bluetooth'],     picsumId: 0   },
  { keywords: ['watch', 'smartwatch'],                               picsumId: 175 },
  { keywords: ['tablet', 'ipad'],                                    picsumId: 180 },
  // Fashion – Men
  { keywords: ['polo', 'shirt', 'tshirt', 't-shirt'],               picsumId: 338 },
  { keywords: ['jeans', 'trouser', 'pant'],                         picsumId: 342 },
  { keywords: ['wallet', 'bag', 'purse'],                           picsumId: 201 },
  // Fashion – Women
  { keywords: ['saree', 'sari'],                                     picsumId: 433 },
  { keywords: ['kurti', 'dress', 'women', 'fashion'],               picsumId: 393 },
  // Home
  { keywords: ['cookware', 'pot', 'pan', 'kitchen'],                picsumId: 292 },
  { keywords: ['pillow', 'cushion', 'mattress'],                    picsumId: 326 },
  { keywords: ['lamp', 'light', 'led'],                             picsumId: 137 },
  { keywords: ['bed', 'sheet', 'bedding'],                          picsumId: 240 },
  // Sports
  { keywords: ['yoga', 'mat', 'fitness'],                           picsumId: 401 },
  { keywords: ['shoe', 'sneaker', 'running'],                       picsumId: 175 },
  { keywords: ['dumbbell', 'weight', 'gym'],                        picsumId: 372 },
  // Grocery / Food
  { keywords: ['honey', 'organic'],                                  picsumId: 488 },
  { keywords: ['tea', 'coffee', 'drink'],                           picsumId: 431 },
  { keywords: ['rice', 'grain', 'food'],                            picsumId: 493 },
];

const DEFAULT_PICSUM_ID = 200; // Generic product fallback

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Pick the best picsumId for a product name */
function pickPicsumId(name) {
  const lower = name.toLowerCase();
  for (const entry of IMAGE_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.picsumId;
  }
  return DEFAULT_PICSUM_ID;
}

/** Download a URL into a Buffer */
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** Download, resize to 1200×1200 WebP, save, return relative path */
async function downloadAndProcess(picsumId, filename) {
  const url = `https://picsum.photos/id/${picsumId}/1200/1200`;
  console.log(`  ↓ Downloading picsum #${picsumId} → ${filename}`);
  const buf = await downloadBuffer(url);
  const outputPath = path.join(UPLOAD_DIR, filename);
  await sharp(buf)
    .resize(1200, 1200, { fit: 'cover', position: 'center' })
    .toFormat('webp', { quality: 85 })
    .toFile(outputPath);
  return `/uploads/products/${filename}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function seedImages() {
  await sequelize.authenticate();
  console.log('✅ DB connected\n');

  // Find products with no image
  const products = await Product.findAll({
    where: { image: null }
  });

  if (products.length === 0) {
    console.log('✅ All products already have images. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${products.length} product(s) without an image. Seeding...\n`);

  let success = 0;
  for (const product of products) {
    try {
      const picsumId = pickPicsumId(product.name);
      const filename  = `demo-${product.id}-${Date.now()}.webp`;
      const imagePath = await downloadAndProcess(picsumId, filename);

      await product.update({ image: imagePath });
      console.log(`  ✅ [${product.id}] ${product.name} → ${imagePath}`);
      success++;

      // Small delay to avoid hammering picsum
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ❌ [${product.id}] ${product.name}: ${err.message}`);
    }
  }

  console.log(`\n✅ Done! ${success}/${products.length} products updated.`);
  process.exit(0);
}

seedImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
