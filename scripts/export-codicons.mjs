import fs from 'fs';

function numberToCssContent(number, escape = '\\\\') {
	return `${escape}${number.toString(16)}`;
}

console.time('Exported codicons');

const { default: iconConfig } = await import('../node_modules/@vscode/codicons/.fantasticonrc.js');
const { name, codepoints: icons } = iconConfig;

const headerText = `// This file is generated by (vscode-gitlens)/scripts/export-codicons.js
// Do not edit this file directly
`;

const sassMapEntries = [];
const tsMapEntries = [];
for (const [key, value] of Object.entries(icons)) {
	sassMapEntries.push(`   '${key}': '${numberToCssContent(value, '\\')}'`);
	tsMapEntries.push(`   '${key}': '${numberToCssContent(value)}'`);
}

// create a sass map of codicons and a ts file with a frozen object
const scss = `${headerText}
$icon-font-family: '${name}';

$icon-map: (
${sassMapEntries.join(',\n')}
);
`;

const ts = `${headerText}
export const iconFontFamily = '${name}';

export const iconMap = Object.freeze({
${tsMapEntries.join(',\n')}
});
`;

const pending = [];

pending.push(fs.promises.writeFile('./src/webviews/apps/shared/styles/icons/codicons-map.scss', scss));
pending.push(fs.promises.writeFile('./src/webviews/apps/shared/components/icons/codicons-map.ts', ts));

await Promise.allSettled(pending);
console.timeEnd('Exported codicons');