import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';
import { applyPatch } from 'fast-json-patch';
import { v4 as uuidv4 } from 'uuid';

import type { JsonPatch } from 'src/features/formData/jsonPatch/types';

interface Props {
  prev: any;
  next: any;
  changesPatch: JsonPatch | undefined;
  backendChangesPatch: JsonPatch;
  applyTo: any;
}

const currentUuid = uuidv4();

/**
 * Takes a previous and next object, and applies the changes from next to prev to the applyTo object.
 */
export function applyChanges({ prev, next, changesPatch, backendChangesPatch, applyTo }: Props) {
  log({ message: 'saving changes to data model', changesPatch, currentUuid });

  if (backendChangesPatch.length > 0) {
    const applyToOurs = structuredClone(applyTo);
    const applyToTheirs = structuredClone(applyTo);
    try {
      log({ message: 'applying changes from backend to our data model', backendChangesPatch, currentUuid });

      applyPatch(applyToTheirs, backendChangesPatch);
      innerApplyChanges({ prev, next, backendChangesPatch, changesPatch: undefined, applyTo: applyToOurs });

      const afterOurApply = structuredClone(applyToOurs);
      if (!deepEqual(applyToTheirs, afterOurApply)) {
        const ourFlat = dot.dot(afterOurApply);
        const theirFlat = dot.dot(applyToTheirs);
        const allKeys = new Set([...Object.keys(ourFlat), ...Object.keys(theirFlat)]);
        const diffValues: { [key: string]: { ours: any; theirs: any } } = {};

        for (const key of allKeys) {
          const ours = ourFlat[key];
          const theirs = theirFlat[key];
          if (!deepEqual(ours, theirs)) {
            diffValues[key] = { ours, theirs };
          }
        }

        const diffKeys = Object.keys(diffValues);
        if (
          diffKeys.length === 1 &&
          diffKeys[0].endsWith('.source') &&
          diffValues[diffKeys[0]].ours === null &&
          diffValues[diffKeys[0]].theirs === 'altinn'
        ) {
          // Known problem, but that's a bug here, not when applying the patch
          return;
        }

        // if (
        //   diffKeys.length === 1 &&
        //   diffValues[diffKeys[0]].ours === null &&
        //   typeof diffValues[diffKeys[0]].theirs === 'string'
        // ) {
        //   // Known problem, user started filling out text, we got a null from the server, but we prefer the text
        //   return;
        // }

        window.CypressSaveLog?.();
        log({
          message: `applyChanges did not match fast-json-patch when applying patch from backend changes`,
          diffValues,
          prev,
          next,
          currentUuid,
        });
      }
    } catch (err) {
      window.CypressSaveLog?.();
      log({
        message: `applyChanges failed to apply patch from backend: ${(err as Error).message}`,
        prev,
        next,
        currentUuid,
      });
    }
  }
}

function log({ message, ...rest }: { [_key: string]: any }) {
  const json = JSON.stringify(rest, undefined, 2);
  window.CypressLog?.(`${message}: ${json}`);

  // eslint-disable-next-line no-console
  // console.log(`${message}: ${json}`);
}

function innerApplyChanges({ prev, next, applyTo, ...rest }: Props) {
  const prevKeys = typeof prev === 'object' && prev ? Object.keys(prev) : [];
  const nextKeys = typeof next === 'object' && next ? Object.keys(next) : [];
  const keys = new Set([...prevKeys, ...nextKeys]);

  for (const key of keys) {
    const prevValue = typeof prev === 'object' && prev ? prev[key] : undefined;
    const nextValue = typeof next === 'object' && next ? next[key] : undefined;
    const current = typeof applyTo === 'object' && applyTo ? applyTo[key] : undefined;
    if (typeof prevValue === 'object' && typeof nextValue === 'object' && prevValue !== null && nextValue !== null) {
      innerApplyChanges({
        prev: prevValue,
        next: nextValue,
        applyTo: applyTo[key] ?? {},
        ...rest,
      });
      continue;
    }
    if (prevValue !== nextValue) {
      if (nextValue === undefined) {
        delete applyTo[key];
      } else if (current && typeof current === 'object' && typeof nextValue === 'object' && nextValue !== null) {
        innerApplyChanges({
          prev: prevValue,
          next: nextValue,
          applyTo: applyTo[key],
          ...rest,
        });
      } else {
        applyTo[key] = nextValue;
      }
    }
  }
}
