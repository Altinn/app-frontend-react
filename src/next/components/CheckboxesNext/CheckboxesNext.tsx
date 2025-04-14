// import React, { useEffect, useMemo, useState } from 'react';
//
// import { useStore } from 'zustand';
//
// import { layoutStore } from 'src/next/stores/layoutStore';
// import { fetchOptions } from 'src/queries/queries';
// import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
// import type { Expression } from 'src/features/expressions/types';
// import type { CompIntermediateExact } from 'src/layout/layout';
// import type { ParamValue } from 'src/utils/urls/appUrlHelper';
//
// interface CheckboxesNextType {
//   component: CompIntermediateExact<'Checkboxes'>;
// }
//
// export const CheckboxesNext: React.FC<CheckboxesNextType> = ({ component }) => {
//   const [localOptions, setLocalOptions] = useState<any>(null);
//
//   const { evaluateExpression, setBoundValue } = useStore(layoutStore, (state) => ({
//     evaluateExpression: state.evaluateExpression,
//     setBoundValue: state.setBoundValue,
//   }));
//   console.log('setBoundValue', setBoundValue);
//
//   // Derive queryParameters only when relevant data changes
//   const queryString = useMemo(() => {
//     if (component.type !== 'Checkboxes' || !component.queryParameters) {
//       return null;
//     }
//
//     const qp: Record<string, ParamValue> = {};
//     Object.entries(component.queryParameters).forEach(([key, val]) => {
//       qp[key] = evaluateExpression(val as Expression);
//     });
//
//     return qp;
//   }, [component.type, component.queryParameters, evaluateExpression]);
//
//   // Fetch options in a useEffect whenever queryString changes
//   useEffect(() => {
//     if (!queryString || !component.optionsId) {
//       return;
//     }
//
//     const fetchTheOptions = async () => {
//       try {
//         const res = await fetchOptions(
//           getOptionsUrl({
//             optionsId: component.optionsId!,
//             queryParameters: queryString,
//           }),
//         );
//         setLocalOptions(res?.data);
//       } catch (e) {
//         // handle or log error
//         console.error(e);
//       }
//     };
//
//     fetchTheOptions();
//   }, [queryString, component.optionsId]);
//
//   return (
//     <div>
//       <pre>{JSON.stringify(localOptions, null, 2)}</pre>
//     </div>
//   );
// };

import React, { useEffect, useState } from 'react';

import { Checkbox } from '@digdir/designsystemet-react';
import { useStore } from 'zustand/index';

import { layoutStore } from 'src/next/stores/layoutStore';
import { fetchOptions } from 'src/queries/queries';
import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
import type { Expression } from 'src/features/expressions/types';
import type { IRawOption } from 'src/layout/common.generated';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { CommonProps } from 'src/next/types/CommonComponentProps';
import type { ParamValue } from 'src/utils/urls/appUrlHelper';

interface CheckboxesNextType {
  component: CompIntermediateExact<'Checkboxes'>;
  commonProps: CommonProps;
}

export const CheckboxesNext: React.FunctionComponent<CheckboxesNextType> = ({ component, commonProps }) => {
  // const [isFetching, setIsFetching] = useState(false);

  console.log(commonProps);
  const [localOptions, setLocalOptions] = useState<IRawOption[]>();

  // const [localOptions, setLocalOptions] = useState<string[]>(
  //   commonProps.currentValue ? commonProps.currentValue.split(',') : [],
  // );

  const optionsQueryParams = useStore(layoutStore, (state) => {
    if (component.type !== 'Checkboxes' || !component.queryParameters) {
      return false;
    }

    const queryString: Record<string, ParamValue> = {};
    Object.entries(component.queryParameters).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];
      const currentValue = state.evaluateExpression(value as unknown as Expression);
      queryString[key] = currentValue;
    });

    return JSON.stringify(queryString, null, 2);
  });

  useEffect(() => {
    if (!optionsQueryParams || !component.optionsId) {
      return;
    }

    const fetchTheOptions = async () => {
      try {
        const res = await fetchOptions(
          getOptionsUrl({
            optionsId: component.optionsId!,
            queryParameters: JSON.parse(optionsQueryParams),
          }),
        );
        setLocalOptions(res?.data);
      } catch (e) {
        // handle or log error
        console.error(e);
      }
    };

    fetchTheOptions();
  }, [optionsQueryParams, component.optionsId]);

  return (
    <div>
      {/*<pre>{JSON.stringify(component, null, 2)}</pre>*/}

      <Checkbox.Group
        legend=''
        role='radiogroup'
      >
        {localOptions?.map((option, idx) => (
          <Checkbox
            value={`${option.value}`}
            description={option.description}
            key={idx}
            onChange={(_) => {
              // let nextOptions: string[] = [];
              // if (localOptions?.includes(e.target.value)) {
              //   nextOptions = localOptions.filter((val) => val !== e.target.value);
              // } else {
              //   localOptions.forEach((val) => nextOptions.push(val));
              //   nextOptions.push(e.target.value);
              // }
              // commonProps.onChange(nextOptions.join(','));
              // setLocalOptions(nextOptions);
            }}
          >
            {option.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};
