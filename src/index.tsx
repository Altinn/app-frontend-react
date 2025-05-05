import { legacyEntry } from 'src/indexold';
import { newEntry } from 'src/newIndex';

const useLegacy = true;

if (useLegacy) {
  legacyEntry();
} else {
  newEntry();
}
