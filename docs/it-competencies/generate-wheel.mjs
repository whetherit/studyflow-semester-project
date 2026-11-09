import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const competencies = [
  // Цифровая трансформация и управление
  ['Трансфер технологий', 'orange', [8]],
  ['Цифровой маркетинг|и медиа', 'orange', []],
  ['Планирование и|управление функциями', 'orange', [4, 5, 6, 7, 8]],
  ['Проектирование и|моделирование деятельности', 'orange', [3, 4, 5, 6, 7, 8]],
  ['Создание платформ,|сетей и экосистем', 'orange', [5, 7]],
  ['Нормативно-правовое|регулирование', 'orange', [5, 8]],
  ['Сбор и использование|данных в управлении', 'orange', [3, 4, 5, 6, 7]],
  ['Практики управления|и орг. деятельности', 'orange', [4, 5, 6, 7, 8]],
  ['Передача компетенций|и управление знаниями', 'orange', [5, 6, 7, 8]],
  ['Вывод продукта|на рынок', 'orange', [7, 8]],

  // Сквозные и перспективные технологии
  ['Управление свойствами|биологических объектов', 'green', []],
  ['Нейротехнологии', 'green', [6]],
  ['Квантовые технологии', 'green', []],
  ['Новые производственные|технологии', 'green', []],
  ['Сенсорика|и робототехника', 'green', [4]],
  ['Новые источники|энергии', 'green', []],
  ['Искусственный интеллект', 'green', [6, 7]],
  ['Большие данные', 'green', [5, 6]],
  ['Промышленный интернет|вещей', 'green', [5]],
  ['Беспроводная связь|и интернет вещей', 'green', [5]],
  ['Системы распределенного|реестра', 'green', []],
  ['Создание современных|хранилищ данных', 'green', [4, 5, 6]],

  // Базовые ИТ-компетенции
  ['Сетевое и системное|администрирование', 'blue', [4, 5]],
  ['Цифровой дизайн', 'blue', [2, 4, 6, 7]],
  ['Кибербезопасность', 'blue', [6]],
  ['Создание ИТ-продукта', 'blue', [1, 2, 3, 4, 5, 6, 7, 8]],

  // Универсальные компетенции
  ['Кросс-культурность', 'red', [1, 2, 3, 4, 5, 6, 7, 8]],
  ['Коммуникация', 'red', [1, 2, 3, 4, 5, 6, 7, 8]],
  ['Тиминг и командное|взаимодействие', 'red', [2, 4, 5, 6, 7, 8]],
  ['Работа с будущим', 'red', [1, 4, 5, 6, 7, 8]],
  ['Мышление|и креативность', 'red', [1, 2, 3, 4, 5, 6, 7, 8]],
  ['Ресурсные состояния', 'red', [1, 2, 3, 4, 8]],
  ['Самоорганизация', 'red', [1, 2, 3, 4, 5, 6, 7, 8]],
  ['Лидерство', 'red', [5, 6, 7, 8]],
];

const palette = {
  orange: { light: '#fff3e4', strong: '#ff9800', line: '#efbd7a' },
  green: { light: '#f1f7eb', strong: '#98bf5a', line: '#bad092' },
  blue: { light: '#eaf4fc', strong: '#2f80c0', line: '#8eb9da' },
  red: { light: '#fdecee', strong: '#f00018', line: '#e7a3ab' },
};

const size = 2000;
const cx = size / 2;
const cy = size / 2;
const innerRadius = 205;
const outerRadius = 570;
const ringWidth = (outerRadius - innerRadius) / 8;
const step = 360 / competencies.length;
const start = -90 - step / 2;

const polar = (radius, degrees) => {
  const radians = degrees * Math.PI / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
};

const segmentPath = (inner, outer, from, to) => {
  const [x1, y1] = polar(outer, from);
  const [x2, y2] = polar(outer, to);
  const [x3, y3] = polar(inner, to);
  const [x4, y4] = polar(inner, from);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outer} ${outer} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${inner} ${inner} 0 0 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
};

const escapeXml = (text) => text
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const cells = [];
const labels = [];
const labelEntries = [];

competencies.forEach(([label, group, semesters], index) => {
  const from = start + index * step;
  const to = from + step;
  const middle = (from + to) / 2;
  const colors = palette[group];

  for (let semester = 1; semester <= 8; semester += 1) {
    const r1 = innerRadius + (semester - 1) * ringWidth;
    const r2 = innerRadius + semester * ringWidth;
    const fill = semesters.includes(semester) ? colors.strong : colors.light;
    cells.push(`<path d="${segmentPath(r1, r2, from, to)}" fill="${fill}" stroke="${colors.line}" stroke-width="1.35"/>`);
  }

  const parts = label.split('|');
  const radians = middle * Math.PI / 180;
  labelEntries.push({
    middle,
    desiredY: cy + Math.sin(radians) * (outerRadius + 65),
    side: Math.cos(radians) >= 0 ? 'right' : 'left',
    parts,
  });
});

for (const side of ['left', 'right']) {
  const sideEntries = labelEntries
    .filter((entry) => entry.side === side)
    .sort((a, b) => a.desiredY - b.desiredY);
  const top = 175;
  const bottom = 1815;
  const gap = sideEntries.length > 1 ? (bottom - top) / (sideEntries.length - 1) : 0;

  sideEntries.forEach((entry, position) => {
    const y = top + position * gap;
    const [lineX1, lineY1] = polar(outerRadius + 4, entry.middle);
    const elbowX = side === 'right' ? 1605 : 395;
    const labelX = side === 'right' ? 1935 : 65;
    const textAnchor = side === 'right' ? 'end' : 'start';
    const lineEndX = side === 'right' ? labelX - 14 : labelX + 14;
    const lineHeight = 24;
    const firstDy = entry.parts.length === 1 ? 0 : -(entry.parts.length - 1) * lineHeight / 2;
    const tspans = entry.parts.map((part, partIndex) =>
      `<tspan x="${labelX}" dy="${partIndex === 0 ? firstDy : lineHeight}">${escapeXml(part)}</tspan>`
    ).join('');

    labels.push(`<polyline points="${lineX1.toFixed(2)},${lineY1.toFixed(2)} ${elbowX},${y.toFixed(2)} ${lineEndX},${y.toFixed(2)}" fill="none" stroke="#8b969f" stroke-width="1.25"/>`);
    labels.push(`<text x="${labelX}" y="${y.toFixed(2)}" text-anchor="${textAnchor}" dominant-baseline="middle" class="label">${tspans}</text>`);
  });
}

const groupLegend = [
  ['Цифровая трансформация и управление', 'orange'],
  ['Сквозные и перспективные технологии', 'green'],
  ['Базовые ИТ-компетенции', 'blue'],
  ['Универсальные компетенции', 'red'],
].map(([name, group], index) => {
  const x = 190 + index * 450;
  return `<rect x="${x}" y="1888" width="24" height="24" rx="4" fill="${palette[group].strong}"/><text x="${x + 36}" y="1907" class="legend">${escapeXml(name)}</text>`;
}).join('');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <style>
    .label { font-family: Arial, 'DejaVu Sans', sans-serif; font-size: 19px; font-weight: 500; fill: #26323b; }
    .center-title { font-family: Arial, 'DejaVu Sans', sans-serif; font-size: 25px; font-weight: 700; fill: #26323b; text-anchor: middle; }
    .center-note { font-family: Arial, 'DejaVu Sans', sans-serif; font-size: 19px; fill: #56636d; text-anchor: middle; }
    .legend { font-family: Arial, 'DejaVu Sans', sans-serif; font-size: 17px; fill: #34424d; }
  </style>
  <text x="1000" y="55" class="center-title" font-size="34">КРУГОВАЯ ДИАГРАММА ИТ-КОМПЕТЕНЦИЙ — АСУб-25</text>
  <text x="1000" y="88" class="center-note">по учебному плану 09.03.01 «Автоматизированные системы обработки информации и управления», набор 2025</text>
  <g>${cells.join('')}</g>
  <circle cx="${cx}" cy="${cy}" r="${innerRadius - 2}" fill="#ffffff" stroke="#71808b" stroke-width="1.6"/>
  <text x="${cx}" y="${cy - 25}" class="center-title">СЕМЕСТРЫ</text>
  <text x="${cx}" y="${cy + 12}" class="center-note">1 — у центра</text>
  <text x="${cx}" y="${cy + 44}" class="center-note">8 — снаружи</text>
  <g>${labels.join('')}</g>
  <g>${groupLegend}</g>
</svg>`;

const target = join(dirname(fileURLToPath(import.meta.url)), 'it-competencies-asub-25.svg');
writeFileSync(target, svg, 'utf8');
console.log(target);
