import { FamilyNode, CanvasPaperSize, FrameScaleSize } from '../../types';

export interface TreeOfLifeExportOptions {
  paperSize: CanvasPaperSize;
  paperDimensions: { width: number; height: number; widthMm: number; heightMm: number };
  frameScaleSize: FrameScaleSize;
  frameScale: number;
  isDarkMode: boolean;
  showConnectors: boolean;
  activeTrahFilter: string;
  frameColorMode: 'generation' | 'trah' | 'hybrid';
  trahName: string;
}

export interface ComputedSVGNode extends FamilyNode {
  x: number;
  y: number;
  color: string;
  trahColor: string;
  frameScale: number;
  isLeafFruit?: boolean;
}

/**
 * Generation name labels mapped to levels 0-6
 */
const GENERATION_LABELS = [
  'Level 0: Uyut (Sesepuh)',
  'Level 1: Kakek / Nenek',
  'Level 2: Orang Tua (Ayah / Ibu)',
  'Level 3: User & Pasangan (Poros)',
  'Level 4: Anak (Penerus)',
  'Level 5: Cucu',
  'Level 6: Cicit'
];

/**
 * Escapes XML strings for safe SVG attribute and text injection
 */
function escapeXML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates publication-ready, lightweight, scalable Vector SVG for the Tree of Life
 * Complete with vector Bezier trunk tapering, inner wood grain (serat kayu),
 * modular leaf cluster defs, fruit nodes, and hierarchical color accents.
 */
export function generateTreeOfLifeSVG(
  nodes: ComputedSVGNode[],
  options: TreeOfLifeExportOptions
): string {
  const {
    paperSize,
    paperDimensions,
    frameScaleSize,
    frameScale,
    isDarkMode,
    showConnectors,
    activeTrahFilter,
    frameColorMode,
    trahName
  } = options;

  const width = paperDimensions.width;
  const height = paperDimensions.height;
  const cx = width / 2;
  const cy = height / 2;

  // Background and Theme Palettes
  const bgFill = isDarkMode ? '#0b0f19' : '#fcfbf7';
  const paperBorderColor = isDarkMode ? '#334155' : '#cbd5e1';
  const filigreeGold = isDarkMode ? 'rgba(245, 158, 11, 0.45)' : 'rgba(217, 119, 6, 0.55)';
  const headerTextColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const subHeaderTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const woodGrainColorLight = isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.65)';
  const woodGrainColorDark = isDarkMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(120, 53, 15, 0.35)';

  // Branch widths tapering upward per specification:
  // 1. Batang & Garis Utama di Bawah (Level Uyut/Akar): 12px - 20px (kokoh menopang seluruh pohon)
  // 2. Cabang Menengah (Level Kakek/Nenek & Ayah/Ibu): 6px - 9px (meruncing bertahap)
  // 3. Ujung Ranting (Menuju Kotak Foto/Buah - Level 4-6): 2px - 4px (luwes & ramping)
  const branchWidthByLevel = [
    18 * frameScale,  // Level 0 (Uyut / Akar Utama: 12px - 20px)
    8.8 * frameScale, // Level 1 (Kakek / Nenek: 6px - 9px)
    6.8 * frameScale, // Level 2 (Ayah / Ibu: 6px - 9px)
    4.8 * frameScale, // Level 3 (User & Pasangan: transisi 4px - 5px)
    3.6 * frameScale, // Level 4 (Anak / Ranting Buah: 2px - 4px)
    2.8 * frameScale, // Level 5 (Cucu: 2px - 3px)
    2.0 * frameScale  // Level 6 (Cicit: 2px)
  ];

  // 1. Build Defs Section (Gradients, Reusable Leaf Clusters, Fruit Nodes, Filters)
  const defs: string[] = [
    `  <defs>`,
    `    <!-- Drop Shadow Filter for Vector Frames -->`,
    `    <filter id="vector-card-shadow" x="-20%" y="-20%" width="140%" height="140%">`,
    `      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="${isDarkMode ? '0.5' : '0.18'}"/>`,
    `    </filter>`,
    `    <filter id="fruit-glow" x="-30%" y="-30%" width="160%" height="160%">`,
    `      <feGaussianBlur stdDeviation="3" result="glow"/>`,
    `      <feComposite in="SourceGraphic" in2="glow" operator="over"/>`,
    `    </filter>`,
    ``,
    `    <!-- Foliage Emerald Gradient -->`,
    `    <linearGradient id="leaf-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `      <stop offset="0%" stop-color="#4ade80" />`,
    `      <stop offset="50%" stop-color="#10b981" />`,
    `      <stop offset="100%" stop-color="#047857" />`,
    `    </linearGradient>`,
    ``,
    `    <!-- Autumn Gold Foliage Gradient -->`,
    `    <linearGradient id="leaf-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `      <stop offset="0%" stop-color="#fde047" />`,
    `      <stop offset="60%" stop-color="#f59e0b" />`,
    `      <stop offset="100%" stop-color="#b45309" />`,
    `    </linearGradient>`,
    ``,
    `    <!-- Ripe Fruit Ruby Gradient -->`,
    `    <radialGradient id="fruit-ruby-grad" cx="35%" cy="35%" r="65%">`,
    `      <stop offset="0%" stop-color="#fda4af" />`,
    `      <stop offset="30%" stop-color="#f43f5e" />`,
    `      <stop offset="85%" stop-color="#be123c" />`,
    `      <stop offset="100%" stop-color="#881337" />`,
    `    </radialGradient>`,
    ``,
    `    <!-- Reusable Leaf Cluster Symbol (3-leaf fan with natural veins) -->`,
    `    <g id="leaf-cluster">`,
    `      <!-- Center Leaf -->`,
    `      <path d="M 0 0 C -6 -14, -4 -28, 0 -34 C 4 -28, 6 -14, 0 0 Z" fill="url(#leaf-emerald-grad)" stroke="#065f46" stroke-width="0.75" />`,
    `      <path d="M 0 -2 L 0 -31" stroke="rgba(255,255,255,0.4)" stroke-width="0.6" stroke-linecap="round" />`,
    `      <path d="M 0 -12 L -3 -16 M 0 -18 L 3 -22 M 0 -24 L -2.5 -27" stroke="rgba(255,255,255,0.3)" stroke-width="0.45" />`,
    `      <!-- Left Leaf -->`,
    `      <g transform="rotate(-38)">`,
    `        <path d="M 0 0 C -5 -11, -3 -22, 0 -28 C 3.5 -22, 5 -11, 0 0 Z" fill="url(#leaf-emerald-grad)" stroke="#065f46" stroke-width="0.7" />`,
    `        <path d="M 0 -2 L 0 -25" stroke="rgba(255,255,255,0.35)" stroke-width="0.5" stroke-linecap="round" />`,
    `      </g>`,
    `      <!-- Right Leaf -->`,
    `      <g transform="rotate(38)">`,
    `        <path d="M 0 0 C -5 -11, -3 -22, 0 -28 C 3.5 -22, 5 -11, 0 0 Z" fill="url(#leaf-emerald-grad)" stroke="#065f46" stroke-width="0.7" />`,
    `        <path d="M 0 -2 L 0 -25" stroke="rgba(255,255,255,0.35)" stroke-width="0.5" stroke-linecap="round" />`,
    `      </g>`,
    `    </g>`,
    ``,
    `    <!-- Reusable Compact Twig Leaf Pair -->`,
    `    <g id="leaf-pair-small">`,
    `      <g transform="rotate(-32)">`,
    `        <path d="M 0 0 C -4 -7, -2 -15, 0 -18 C 2.5 -15, 4 -7, 0 0 Z" fill="url(#leaf-emerald-grad)" stroke="#065f46" stroke-width="0.5" />`,
    `      </g>`,
    `      <g transform="rotate(32)">`,
    `        <path d="M 0 0 C -4 -7, -2 -15, 0 -18 C 2.5 -15, 4 -7, 0 0 Z" fill="url(#leaf-emerald-grad)" stroke="#065f46" stroke-width="0.5" />`,
    `      </g>`,
    `    </g>`,
    ``,
    `    <!-- Reusable Ripe Fruit Accent Symbol (Berry / Fig with Calyx) -->`,
    `    <g id="fruit-node">`,
    `      <!-- Stem -->`,
    `      <path d="M 0 0 Q -2 6, -1 10" stroke="#78350f" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
    `      <!-- Fruit Body -->`,
    `      <circle cx="-1" cy="17" r="7" fill="url(#fruit-ruby-grad)" filter="url(#fruit-glow)"/>`,
    `      <!-- Calyx Leaflet -->`,
    `      <path d="M -1 11 Q -3 9, -5 10 Q -2 11, -1 12" fill="#15803d"/>`,
    `      <!-- Specular Highlight Dot -->`,
    `      <circle cx="-3" cy="14" r="1.5" fill="#ffffff" opacity="0.7"/>`,
    `    </g>`,
    ``,
    `    <!-- Reusable Golden Laurel Crown (User & Pasangan Level 3) -->`,
    `    <g id="laurel-wreath">`,
    `      <path d="M -22 10 C -34 -4, -30 -22, -14 -32 C -8 -36, 0 -38, 0 -38" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round"/>`,
    `      <path d="M 22 10 C 34 -4, 30 -22, 14 -32 C 8 -36, 0 -38, 0 -38" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round"/>`,
    `      <!-- Left Laurel Leaves -->`,
    `      <ellipse cx="-26" cy="4" rx="4.5" ry="2.2" transform="rotate(-25, -26, 4)" fill="#f59e0b" opacity="0.9"/>`,
    `      <ellipse cx="-30" cy="-10" rx="4.5" ry="2.2" transform="rotate(20, -30, -10)" fill="#f59e0b" opacity="0.9"/>`,
    `      <ellipse cx="-22" cy="-24" rx="4.5" ry="2.2" transform="rotate(45, -22, -24)" fill="#f59e0b" opacity="0.9"/>`,
    `      <!-- Right Laurel Leaves -->`,
    `      <ellipse cx="26" cy="4" rx="4.5" ry="2.2" transform="rotate(25, 26, 4)" fill="#f59e0b" opacity="0.9"/>`,
    `      <ellipse cx="30" cy="-10" rx="4.5" ry="2.2" transform="rotate(-20, 30, -10)" fill="#f59e0b" opacity="0.9"/>`,
    `      <ellipse cx="22" cy="-24" rx="4.5" ry="2.2" transform="rotate(-45, 22, -24)" fill="#f59e0b" opacity="0.9"/>`,
    `    </g>`
  ];

  // Dynamic Gradients for each branch connection
  if (showConnectors) {
    nodes.forEach(node => {
      if (!node.parentId) return;
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent) return;
      if (activeTrahFilter !== 'ALL' && parent.trah !== activeTrahFilter) return;

      const gradId = `trunk-grad-${parent.id}-${node.id}`;
      const startColor = parent.level === 0 ? (isDarkMode ? '#b45309' : '#d97706') : parent.color;
      const endColor = node.color;

      defs.push(`    <linearGradient id="${gradId}" x1="0%" y1="100%" x2="0%" y2="0%">`);
      defs.push(`      <stop offset="0%" stop-color="${startColor}" />`);
      defs.push(`      <stop offset="100%" stop-color="${endColor}" />`);
      defs.push(`    </linearGradient>`);
    });
  }

  defs.push(`  </defs>`);

  // 2. Trunk, Wood Grain, and Double Tracks Flow Paths
  const branchesSVG: string[] = [];
  const woodGrainSVG: string[] = [];
  const rootTendrilsSVG: string[] = [];
  const leafFruitInstancesSVG: string[] = [];

  if (showConnectors) {
    nodes.forEach(node => {
      if (!node.parentId) return;
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent) return;
      if (activeTrahFilter !== 'ALL' && parent.trah !== activeTrahFilter) return;

      // Coordinates mapped to SVG space (centered around cx, cy)
      const p1 = { x: cx + parent.x, y: cy + parent.y };
      const p2 = { x: cx + node.x, y: cy + node.y };

      const w1 = branchWidthByLevel[parent.level] ?? (16 * frameScale);
      const w2 = branchWidthByLevel[node.level] ?? (3.6 * frameScale);

      const dy = p2.y - p1.y;
      const dx = p2.x - p1.x;

      // Bezier control points
      const cp1 = { x: p1.x + dx * 0.12, y: p1.y + dy * 0.5 };
      const cp2 = { x: p2.x - dx * 0.12, y: p1.y + dy * 0.5 };

      // Normal offset vectors at start
      const p1L = { x: p1.x - w1 / 2, y: p1.y };
      const p1R = { x: p1.x + w1 / 2, y: p1.y };

      // Normal offset vectors at end
      const ndx = p2.x - cp2.x;
      const ndy = p2.y - cp2.y;
      const nlen = Math.hypot(ndx, ndy) || 1;
      const nx = -ndy / nlen;
      const ny = ndx / nlen;

      const p2L = { x: p2.x - nx * (w2 / 2), y: p2.y - ny * (w2 / 2) };
      const p2R = { x: p2.x + nx * (w2 / 2), y: p2.y + ny * (w2 / 2) };

      const cp1L = { x: cp1.x - w1 * 0.42, y: cp1.y };
      const cp1R = { x: cp1.x + w1 * 0.42, y: cp1.y };
      const cp2L = { x: cp2.x - w2 * 0.42, y: cp2.y };
      const cp2R = { x: cp2.x + w2 * 0.42, y: cp2.y };

      const gradId = `trunk-grad-${parent.id}-${node.id}`;
      const fillOpacity = isDarkMode ? 0.35 : 0.42;

      // Tapered Organic Trunk Ribbon
      branchesSVG.push(
        `    <path d="M ${p1L.x.toFixed(1)} ${p1L.y.toFixed(1)} ` +
        `C ${cp1L.x.toFixed(1)} ${cp1L.y.toFixed(1)}, ${cp2L.x.toFixed(1)} ${cp2L.y.toFixed(1)}, ${p2L.x.toFixed(1)} ${p2L.y.toFixed(1)} ` +
        `L ${p2R.x.toFixed(1)} ${p2R.y.toFixed(1)} ` +
        `C ${cp2R.x.toFixed(1)} ${cp2R.y.toFixed(1)}, ${cp1R.x.toFixed(1)} ${cp1R.y.toFixed(1)}, ${p1R.x.toFixed(1)} ${p1R.y.toFixed(1)} Z" ` +
        `fill="url(#${gradId})" fill-opacity="${fillOpacity}" />`
      );

      // Outer Double Tracks (Garis Pembungkus Ganda Berkelok)
      // Tapered stroke width: 3.0px at root foundation, 2.0px at mid branches, 1.4px at twigs
      const trackStrokeWidth = (
        parent.level === 0 ? Math.max(2.4, 3.0 * frameScale) :
        parent.level <= 2 ? Math.max(1.8, 2.2 * frameScale) :
        Math.max(1.2, 1.5 * frameScale)
      ).toFixed(1);
      const trackOpacity = isDarkMode ? 0.95 : 0.88;

      branchesSVG.push(
        `    <!-- Left Track -->\n` +
        `    <path d="M ${p1L.x.toFixed(1)} ${p1L.y.toFixed(1)} C ${cp1L.x.toFixed(1)} ${cp1L.y.toFixed(1)}, ${cp2L.x.toFixed(1)} ${cp2L.y.toFixed(1)}, ${p2L.x.toFixed(1)} ${p2L.y.toFixed(1)}" ` +
        `stroke="url(#${gradId})" stroke-width="${trackStrokeWidth}" fill="none" stroke-opacity="${trackOpacity}" stroke-linecap="round"/>`
      );

      branchesSVG.push(
        `    <!-- Right Track -->\n` +
        `    <path d="M ${p1R.x.toFixed(1)} ${p1R.y.toFixed(1)} C ${cp1R.x.toFixed(1)} ${cp1R.y.toFixed(1)}, ${cp2R.x.toFixed(1)} ${cp2R.y.toFixed(1)}, ${p2R.x.toFixed(1)} ${p2R.y.toFixed(1)}" ` +
        `stroke="url(#${gradId})" stroke-width="${trackStrokeWidth}" fill="none" stroke-opacity="${trackOpacity}" stroke-linecap="round"/>`
      );

      // Vector Wood Grain (Serat Kayu) inside trunk & mid-branches
      if (w1 >= 6.5 * frameScale) {
        // Grain 1: Left inner grain line
        const g1_p1 = { x: p1.x - w1 * 0.22, y: p1.y };
        const g1_p2 = { x: p2.x - nx * (w2 * 0.22), y: p2.y - ny * (w2 * 0.22) };
        const g1_cp1 = { x: cp1.x - w1 * 0.18, y: cp1.y };
        const g1_cp2 = { x: cp2.x - w2 * 0.18, y: cp2.y };

        woodGrainSVG.push(
          `    <path d="M ${g1_p1.x.toFixed(1)} ${g1_p1.y.toFixed(1)} C ${g1_cp1.x.toFixed(1)} ${g1_cp1.y.toFixed(1)}, ${g1_cp2.x.toFixed(1)} ${g1_cp2.y.toFixed(1)}, ${g1_p2.x.toFixed(1)} ${g1_p2.y.toFixed(1)}" ` +
          `stroke="${woodGrainColorDark}" stroke-width="1.1" stroke-dasharray="10 4 18 5" fill="none" opacity="0.6"/>`
        );

        // Grain 2: Center marrow luminescent line
        woodGrainSVG.push(
          `    <path d="M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.x.toFixed(1)}" ` +
          `stroke="${woodGrainColorLight}" stroke-width="0.9" stroke-dasharray="6 8" fill="none" opacity="0.75"/>`
        );

        // Grain 3: Right inner grain line
        const g3_p1 = { x: p1.x + w1 * 0.22, y: p1.y };
        const g3_p2 = { x: p2.x + nx * (w2 * 0.22), y: p2.y + ny * (w2 * 0.22) };
        const g3_cp1 = { x: cp1.x + w1 * 0.18, y: cp1.y };
        const g3_cp2 = { x: cp2.x + w2 * 0.18, y: cp2.y };

        woodGrainSVG.push(
          `    <path d="M ${g3_p1.x.toFixed(1)} ${g3_p1.y.toFixed(1)} C ${g3_cp1.x.toFixed(1)} ${g3_cp1.y.toFixed(1)}, ${g3_cp2.x.toFixed(1)} ${g3_cp2.y.toFixed(1)}, ${g3_p2.x.toFixed(1)} ${g3_p2.y.toFixed(1)}" ` +
          `stroke="${woodGrainColorDark}" stroke-width="1.0" stroke-dasharray="14 6 8 4" fill="none" opacity="0.5"/>`
        );
      }

      // Attach modular leaf cluster or fruit symbol at terminal branch endpoints
      if (node.level >= 4) {
        const clusterScale = (node.frameScale * 0.95).toFixed(2);
        leafFruitInstancesSVG.push(
          `    <!-- Instanced Leaf Cluster at Node ${node.id} -->\n` +
          `    <use href="#leaf-cluster" x="${p2.x.toFixed(1)}" y="${(p2.y - 12 * frameScale).toFixed(1)}" transform="scale(${clusterScale})" />`
        );

        if (node.level >= 5) {
          // Add ripe fruit accent
          leafFruitInstancesSVG.push(
            `    <use href="#fruit-node" x="${(p2.x + 14 * frameScale).toFixed(1)}" y="${(p2.y - 6 * frameScale).toFixed(1)}" />`
          );
        }
      }
    });

    // Root tendrils beneath Level 0 (Uyut) - thick anchor roots (12px-20px foundation zone)
    nodes.filter(n => n.level === 0).forEach(root => {
      const rx = cx + root.x;
      const ry = cy + root.y;
      const rootColor = isDarkMode ? 'rgba(217, 119, 6, 0.7)' : 'rgba(180, 83, 9, 0.8)';
      const rootW = Math.max(2.8, 3.6 * frameScale).toFixed(1);

      [-26 * frameScale, 0, 26 * frameScale].forEach((offset, idx) => {
        const x1 = (rx + offset).toFixed(1);
        const y1 = (ry + 24 * frameScale).toFixed(1);
        const cpX1 = (rx + offset * 1.5).toFixed(1);
        const cpY1 = (ry + 55 * frameScale).toFixed(1);
        const cpX2 = (rx + offset * 2.2).toFixed(1);
        const cpY2 = (ry + 80 * frameScale).toFixed(1);
        const endX = (rx + offset * (2.8 + idx * 0.25)).toFixed(1);
        const endY = (ry + 105 * frameScale).toFixed(1);

        rootTendrilsSVG.push(
          `    <path d="M ${x1} ${y1} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX} ${endY}" ` +
          `stroke="${rootColor}" stroke-width="${rootW}" fill="none" stroke-linecap="round"/>`
        );
      });
    });
  }

  // 3. Node Card Frames & Photo Discs
  const nodesSVG: string[] = [];

  nodes.forEach(node => {
    const nx = cx + node.x;
    const ny = cy + node.y;
    const scaleMult = node.frameScale || 1.0;
    const initial = escapeXML(node.name.charAt(0).toUpperCase());
    const safeName = escapeXML(node.name);
    const safeTitle = escapeXML(node.title || GENERATION_LABELS[node.level].split(':')[1]?.trim() || '');
    const genPill = escapeXML(GENERATION_LABELS[node.level].split(':')[1]?.trim() || '');

    if (node.level <= 3) {
      // Large Photo Card Frame (Uyut, Kakek/Nenek, Ayah/Ibu, User & Pasangan)
      const w = Math.round(118 * scaleMult);
      const h = Math.round(48 * scaleMult);
      const rx = -w / 2;
      const ry = -h / 2;
      const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
      const borderCol = node.color;
      const avatarR = Math.round(15 * scaleMult);
      const avatarX = rx + avatarR + Math.round(8 * scaleMult);
      const avatarFill = frameColorMode === 'generation' ? node.color : node.trahColor;

      nodesSVG.push(`    <!-- Card Frame Node: ${node.id} -->`);
      nodesSVG.push(`    <g transform="translate(${nx.toFixed(1)}, ${ny.toFixed(1)})" filter="url(#vector-card-shadow)">`);

      // Laurel Wreath for User & Pasangan (Level 3)
      if (node.level === 3) {
        nodesSVG.push(`      <use href="#laurel-wreath" x="0" y="0" />`);
      }

      // Card Base Rect
      nodesSVG.push(
        `      <rect x="${rx}" y="${ry}" width="${w}" height="${h}" rx="${Math.round(10 * scaleMult)}" ` +
        `fill="${cardBg}" stroke="${borderCol}" stroke-width="${Math.max(2, Math.round(2.5 * scaleMult))}" />`
      );

      // Avatar Circle
      nodesSVG.push(
        `      <circle cx="${avatarX}" cy="0" r="${avatarR}" fill="${avatarFill}" />`
      );
      nodesSVG.push(
        `      <text x="${avatarX}" y="4" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" ` +
        `font-weight="bold" font-size="${Math.round(12 * scaleMult)}" fill="#ffffff">${initial}</text>`
      );

      // Name & Subtitle
      const maxLen = scaleMult >= 1.4 ? 14 : 11;
      const truncName = safeName.length > maxLen ? safeName.substring(0, maxLen - 1) + '..' : safeName;
      const truncTitle = safeTitle.length > maxLen + 4 ? safeTitle.substring(0, maxLen + 3) + '..' : safeTitle;

      nodesSVG.push(
        `      <text x="${avatarX + avatarR + Math.round(7 * scaleMult)}" y="${ry + Math.round(20 * scaleMult)}" ` +
        `font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="${Math.round(10.5 * scaleMult)}" ` +
        `fill="${headerTextColor}">${truncName}</text>`
      );
      nodesSVG.push(
        `      <text x="${avatarX + avatarR + Math.round(7 * scaleMult)}" y="${ry + Math.round(34 * scaleMult)}" ` +
        `font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(8.5 * scaleMult)}" ` +
        `fill="${subHeaderTextColor}">${truncTitle}</text>`
      );

      // Generation Badge Tag (Top Pill)
      const pillW = Math.round(52 * scaleMult);
      const pillH = Math.round(12 * scaleMult);
      nodesSVG.push(
        `      <rect x="${-pillW / 2}" y="${ry - Math.round(6 * scaleMult)}" width="${pillW}" height="${pillH}" rx="3" ` +
        `fill="${node.color}" />`
      );
      nodesSVG.push(
        `      <text x="0" y="${ry + Math.round(3 * scaleMult)}" text-anchor="middle" ` +
        `font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="${Math.round(7.5 * scaleMult)}" ` +
        `fill="#ffffff">${genPill}</text>`
      );

      // Claimed Badge Dot
      if (node.claimed) {
        nodesSVG.push(
          `      <circle cx="${rx + w - Math.round(8 * scaleMult)}" cy="${ry + Math.round(8 * scaleMult)}" r="${Math.round(4 * scaleMult)}" fill="#10b981"/>`
        );
      }

      nodesSVG.push(`    </g>`);
    } else {
      // Modul Buah/Daun Circular Node (Level 4+ Anak, Cucu, Cicit)
      const radius = Math.round(18 * scaleMult);
      const innerColor = frameColorMode === 'generation' ? node.color : node.trahColor;

      nodesSVG.push(`    <!-- Circular Fruit/Leaf Node: ${node.id} -->`);
      nodesSVG.push(`    <g transform="translate(${nx.toFixed(1)}, ${ny.toFixed(1)})" filter="url(#vector-card-shadow)">`);

      // Outer ring
      nodesSVG.push(
        `      <circle cx="0" cy="0" r="${radius}" fill="${innerColor}" stroke="${node.color}" stroke-width="${Math.max(2, Math.round(2.5 * scaleMult))}" />`
      );
      // Initial
      nodesSVG.push(
        `      <text x="0" y="4" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" ` +
        `font-weight="bold" font-size="${Math.round(11 * scaleMult)}" fill="#ffffff">${initial}</text>`
      );
      // Name below
      nodesSVG.push(
        `      <text x="0" y="${radius + Math.round(13 * scaleMult)}" text-anchor="middle" ` +
        `font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="${Math.round(9.5 * scaleMult)}" ` +
        `fill="${headerTextColor}">${safeName}</text>`
      );

      // Claimed Dot
      if (node.claimed) {
        nodesSVG.push(
          `      <circle cx="${Math.round(radius * 0.7)}" cy="${-Math.round(radius * 0.7)}" r="${Math.round(3.5 * scaleMult)}" fill="#10b981"/>`
        );
      }

      nodesSVG.push(`    </g>`);
    }
  });

  // 4. Header, Decorative Filigree Print Frame, Registration Marks
  const margin = 36;
  const pw = width - margin * 2;
  const ph = height - margin * 2;
  const markLen = 16;

  const headerSVG = [
    `  <!-- Decorative Borders & Crop Marks -->`,
    `  <rect x="${margin}" y="${margin}" width="${pw}" height="${ph}" fill="none" stroke="${paperBorderColor}" stroke-width="2"/>`,
    `  <rect x="${margin + 12}" y="${margin + 12}" width="${pw - 24}" height="${ph - 24}" fill="none" stroke="${filigreeGold}" stroke-width="1.5"/>`,
    ``,
    `  <!-- Registration Crop Marks (+) -->`,
    `  <path d="M ${margin + 12} ${margin} L ${margin + 12} ${margin + markLen} M ${margin} ${margin + 12} L ${margin + markLen} ${margin + 12}" stroke="${paperBorderColor}" stroke-width="1.5"/>`,
    `  <path d="M ${width - margin - 12} ${margin} L ${width - margin - 12} ${margin + markLen} M ${width - margin} ${margin + 12} L ${width - margin - markLen} ${margin + 12}" stroke="${paperBorderColor}" stroke-width="1.5"/>`,
    `  <path d="M ${margin + 12} ${height - margin} L ${margin + 12} ${height - margin - markLen} M ${margin} ${height - margin - 12} L ${margin + markLen} ${height - margin - 12}" stroke="${paperBorderColor}" stroke-width="1.5"/>`,
    `  <path d="M ${width - margin - 12} ${height - margin} L ${width - margin - 12} ${height - margin - markLen} M ${width - margin} ${height - margin - 12} L ${width - margin - markLen} ${height - margin - 12}" stroke="${paperBorderColor}" stroke-width="1.5"/>`,
    ``,
    `  <!-- Title & Metadata Header -->`,
    `  <text x="${cx}" y="${margin + 42}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="22" fill="${headerTextColor}" letter-spacing="1.5">BAGAN SILSILAH KELUARGA BESAR 7 GENERASI</text>`,
    `  <text x="${cx}" y="${margin + 62}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="11" fill="${subHeaderTextColor}">Format Cetak: ${paperSize} (${paperDimensions.widthMm} × ${paperDimensions.heightMm} mm) • Skala Frame: ${frameScaleSize} • Engine: Tree of Life (Organic Flow &amp; Double Tracks) • Trah: ${escapeXML(trahName)}</text>`,
    `  <text x="${cx}" y="${height - margin - 18}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="9.5" fill="${subHeaderTextColor}">Dokumen Digital Resmi Silsilah LeluhurQu • Hak Cipta Terpelihara • Dihasilkan dalam Format Vektor SVG Resolusi Tanpa Batas</text>`
  ].join('\n');

  // Complete SVG String
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <!-- Background Canvas -->`,
    `  <rect width="${width}" height="${height}" fill="${bgFill}"/>`,
    defs.join('\n'),
    headerSVG,
    `  <!-- 1. Root Tendrils -->`,
    rootTendrilsSVG.join('\n'),
    `  <!-- 2. Dynamic Tapered Trunk Ribbons & Double Tracks -->`,
    branchesSVG.join('\n'),
    `  <!-- 3. Vector Wood Grain (Serat Kayu) -->`,
    woodGrainSVG.join('\n'),
    `  <!-- 4. Modular Leaf Clusters & Fruits -->`,
    leafFruitInstancesSVG.join('\n'),
    `  <!-- 5. Hierarchical Family Nodes & Card Frames -->`,
    nodesSVG.join('\n'),
    `</svg>`
  ].join('\n');
}
