
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

async function r({files:o}){await o("**/*.ts").jsFam().astGrep("console.log($A)").replace("console.error($A)")}export{r as workflow};
