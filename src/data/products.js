// 10 seed products across 6 categories, each localized (en / fr / ar).
// Used by the mock data layer AND by scripts/seed.js to populate Firestore.
// Prices are in Moroccan Dirham (MAD / DH).
//
// `img(id)` builds an Unsplash URL; the <ProductImage> component falls back to
// a generated gradient placeholder if a URL fails to load, so the demo always
// looks complete.

const img = (id) => `https://images.unsplash.com/photo-${id}?w=700&q=80&auto=format&fit=crop`

const IMG = {
  serum: img('1620916566398-39f1143ab7be'),
  cream: img('1608248543803-ba4f8c70ae0b'),
  foundation: img('1590156206657-aec9b0e4c1a6'),
  lipstick: img('1631730359585-38a4935cbec4'),
  shampoo: img('1526947425960-945c6e72858f'),
  oil: img('1608571423902-eed4a5ad8108'),
  perfume: img('1592945403244-b3fbafd7f539'),
  perfume2: img('1541643600914-78b084683601'),
  body: img('1570194065650-d99fb4bedf0a'),
  brushes: img('1503236823255-94609f598e71'),
}

// helper to keep entries compact
const p = (id, cat, price, stock, image, featured, name, description) => ({
  id,
  category: cat,
  price,
  stock,
  imageUrl: image,
  featured: !!featured,
  name,
  description,
  // deterministic timestamps so "newest" sorting is stable in the demo
  createdAt: `2025-${String((parseInt(id.slice(1)) % 12) + 1).padStart(2, '0')}-15T10:00:00.000Z`,
})

export const PRODUCTS = [
  // ───────────────────────── SKINCARE ─────────────────────────
  p('p001', 'skincare', 189, 32, IMG.serum, true,
    { en: 'Vitamin C Glow Serum', fr: 'Sérum Éclat Vitamine C', ar: 'سيروم فيتامين سي المشرق' },
    { en: 'A brightening serum with 15% vitamin C to even tone and revive dull skin.', fr: 'Un sérum éclaircissant à 15% de vitamine C pour unifier le teint et raviver la peau terne.', ar: 'سيروم مضيء بنسبة 15% من فيتامين سي لتوحيد لون البشرة وإنعاش البشرة الباهتة.' }),
  p('p003', 'skincare', 219, 18, IMG.cream, true,
    { en: 'Rose Night Recovery Cream', fr: 'Crème de Nuit Réparatrice à la Rose', ar: 'كريم الورد الليلي المرمم' },
    { en: 'A rich overnight cream infused with rose oil to restore softness by morning.', fr: "Une crème de nuit riche à l'huile de rose pour retrouver douceur au réveil.", ar: 'كريم ليلي غني بزيت الورد لاستعادة نعومة البشرة عند الصباح.' }),

  // ───────────────────────── MAKEUP ─────────────────────────
  p('p011', 'makeup', 129, 38, IMG.foundation, true,
    { en: 'Silk Matte Foundation', fr: 'Fond de Teint Mat Soie', ar: 'كريم أساس مطفي حريري' },
    { en: 'Medium-to-full coverage foundation with a soft matte, skin-like finish.', fr: 'Fond de teint couvrance modulable au fini mat naturel.', ar: 'كريم أساس بتغطية متوسطة إلى كاملة بلمسة مطفية طبيعية.' }),
  p('p012', 'makeup', 79, 65, IMG.lipstick, true,
    { en: 'Velvet Matte Lipstick — Rosewood', fr: 'Rouge à Lèvres Velours — Bois de Rose', ar: 'أحمر شفاه مخملي — خشب الورد' },
    { en: 'Long-wearing velvet lipstick in a flattering rosewood nude.', fr: 'Rouge à lèvres velours longue tenue dans un nude bois de rose.', ar: 'أحمر شفاه مخملي يدوم طويلاً بلون خشب الورد الجذاب.' }),

  // ───────────────────────── HAIRCARE ─────────────────────────
  p('p023', 'haircare', 119, 34, IMG.shampoo, true,
    { en: 'Argan Repair Shampoo', fr: 'Shampoing Réparateur à l\'Argan', ar: 'شامبو الأرغان المرمم' },
    { en: 'Sulfate-free shampoo with Moroccan argan oil to nourish dry hair.', fr: "Shampoing sans sulfate à l'huile d'argan marocaine pour nourrir les cheveux secs.", ar: 'شامبو خالٍ من السلفات بزيت الأرغان المغربي لتغذية الشعر الجاف.' }),
  p('p025', 'haircare', 159, 26, IMG.oil, true,
    { en: 'Pure Moroccan Argan Oil', fr: 'Huile d\'Argan Pure du Maroc', ar: 'زيت الأرغان المغربي النقي' },
    { en: '100% pure argan oil to tame frizz and revive dull, damaged ends.', fr: "Huile d'argan 100% pure pour discipliner les frisottis et raviver les pointes.", ar: 'زيت أرغان نقي 100% لترويض التجعد وإحياء الأطراف التالفة.' }),

  // ───────────────────────── FRAGRANCE ─────────────────────────
  p('p031', 'fragrance', 349, 18, IMG.perfume, true,
    { en: 'Rose Élixir Eau de Parfum', fr: 'Rose Élixir Eau de Parfum', ar: 'روز إليكسير أو دو بارفان' },
    { en: 'A romantic bouquet of Damask rose, peony and soft musk.', fr: 'Un bouquet romantique de rose de Damas, pivoine et musc doux.', ar: 'باقة رومانسية من الورد الدمشقي والفاوانيا والمسك الناعم.' }),
  p('p032', 'fragrance', 389, 14, IMG.perfume2, true,
    { en: 'Oud Noir Eau de Parfum', fr: 'Oud Noir Eau de Parfum', ar: 'عود نوار أو دو بارفان' },
    { en: 'A warm, mysterious blend of oud, amber and vanilla.', fr: "Un mélange chaud et mystérieux d'oud, ambre et vanille.", ar: 'مزيج دافئ وغامض من العود والعنبر والفانيليا.' }),

  // ───────────────────────── BODY CARE ─────────────────────────
  p('p038', 'bodycare', 79, 50, IMG.body, true,
    { en: 'Shea Body Butter', fr: 'Beurre Corporel au Karité', ar: 'زبدة الجسم بالشيا' },
    { en: 'Ultra-rich shea butter that deeply nourishes dry skin.', fr: 'Beurre de karité ultra-riche qui nourrit intensément la peau sèche.', ar: 'زبدة شيا فائقة الغنى تغذي البشرة الجافة بعمق.' }),

  // ───────────────────────── TOOLS & ACCESSORIES ─────────────────────────
  p('p045', 'tools', 199, 30, IMG.brushes, true,
    { en: 'Pro Makeup Brush Set (12 pcs)', fr: 'Set de Pinceaux Pro (12 pièces)', ar: 'طقم فرش مكياج احترافي (12 قطعة)' },
    { en: 'A complete 12-piece brush set with a soft vegan bristle finish.', fr: 'Set complet de 12 pinceaux aux poils vegan doux.', ar: 'طقم فرش كامل من 12 قطعة بشعيرات نباتية ناعمة.' }),
]

export default PRODUCTS
