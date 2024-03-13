import { FD } from 'src/features/formData/FormDataWrite';
import { MissingRowIdException } from 'src/features/formData/MissingRowIdException';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useLanguage } from 'src/features/language/useLanguage';
import { useAllOptionsSelector } from 'src/features/options/useAllOptions';
import { getLikertStartStopIndex } from 'src/utils/formLayout';
import type { IDataModelBindingsLikertInternal } from 'src/layout/common.generated';
import type { CompLikertInternal, ILikertFilter } from 'src/layout/Likert/config.generated';

export interface LikertRow {
  uuid: string;
  index: number;
  answerPath: string | undefined;
  getDisplayData: () => string;
}

interface RawRow {
  [ALTINN_ROW_ID]: string;
  index: number;
}

const emptyArray = [];

export function getLikertRows(rows: unknown, filter: ILikertFilter | undefined): RawRow[] | undefined {
  if (!Array.isArray(rows)) {
    return undefined;
  }

  // Only return the row ID for each row. The rest can be picked out from the selector if needed.
  const allRows = rows.map((row, index) => ({ [ALTINN_ROW_ID]: row[ALTINN_ROW_ID], index }));

  if (filter) {
    const lastIndex = allRows.length - 1;
    const { startIndex, stopIndex } = getLikertStartStopIndex(lastIndex, filter);
    return allRows.slice(startIndex, stopIndex + 1);
  }

  return allRows;
}

export function questionToAnswerBinding(bindings: IDataModelBindingsLikertInternal, row: RawRow) {
  const { questions, answer } = bindings;
  const answerPath = answer?.indexOf(`${questions}.`) === 0 ? answer.substring(questions.length + 1) : undefined;

  return answerPath ? `${questions}[${row.index}].${answerPath}` : undefined;
}

export function useLikertRows({ id, dataModelBindings, filter }: CompLikertInternal): LikertRow[] {
  const questions = dataModelBindings?.questions;
  const optionsSelector = useAllOptionsSelector();
  const formDataSelector = FD.useDebouncedSelector();
  const formData = formDataSelector(questions, (rows) => getLikertRows(rows, filter)) as RawRow[] | undefined;
  const { langAsString } = useLanguage();

  if (!formData || !Array.isArray(formData)) {
    return emptyArray;
  }

  return formData.map((row) => {
    if (!(ALTINN_ROW_ID in row) || row[ALTINN_ROW_ID] === undefined) {
      throw new MissingRowIdException(`${questions}[${row.index}]`);
    }

    const fullAnswerPath = questionToAnswerBinding(dataModelBindings, row);
    return {
      uuid: row[ALTINN_ROW_ID],
      index: row.index,
      answerPath: fullAnswerPath,
      getDisplayData: () => {
        const answerData = fullAnswerPath ? formDataSelector(fullAnswerPath) : undefined;
        if (!answerData) {
          return '';
        }

        const options = optionsSelector(id);
        const option = options.find((o) => o.value === answerData)?.label;
        return option ? langAsString(option) : '';
      },
    };
  });
}
