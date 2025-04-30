import { legacyEntry } from 'src/indexold';
import { newEntry } from 'src/newIndex';

const useLegacy = false;

if (useLegacy) {
  legacyEntry();
} else {
  newEntry();
}
