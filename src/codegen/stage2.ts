import { ComponentConfigGenerators } from 'src/codegen/generators.generated';
import { saveFile } from 'src/codegen/tools';

for (const generator of Object.values(ComponentConfigGenerators)) {
  console.log('Generating', generator.type);
  const path = `src/layout/${generator.type}/types.generated.d.ts`;
  const content = generator.toTypeScript();
  saveFile(path, content);
}
