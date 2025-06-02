const backtick = '`';

export function markdownCode(code: string): string {
  if (code.includes('\n')) {
    return `${backtick.repeat(3)}\n${code}\n${backtick.repeat(3)}`;
  }
  return `${backtick}${code}${backtick}`;
}

export function markdownTable<T extends object>(data: T[]): string {
  if (!data.length) {
    return '';
  }

  const colMax = maxColsForTable(data);
  const headerRow = Object.keys(data[0]);
  const emptyRow = headerRow.map(() => '');
  const dataRows = data.map((row) => headerRow.map((header) => row[header]));

  function join(data: string[], padding = ' ', extra = 0, joiner = ' | '): string {
    return data.map((d, i) => `${d.padEnd(colMax[i] + extra, padding)}`).join(joiner);
  }

  const lines = [
    `| ${join(headerRow)} |`,
    `|${join(emptyRow, '-', 2, '|')}|`,
    ...dataRows.map((row) => `| ${join(row)} |`),
  ];
  return lines.join('\n');
}

function maxColsForTable<T extends object>(data: T[]): number[] {
  const out: number[] = [];
  for (const col of Object.keys(data[0])) {
    out.push(Math.max(col.length, ...data.map((row) => row[col].length)));
  }
  return out;
}
