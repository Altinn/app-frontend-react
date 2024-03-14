import React from 'react';

import { EyeSlashIcon } from '@navikt/aksel-icons';

import classes from 'src/features/devtools/components/NodeInspector/ValidationInspector.module.css';
import { Lang } from 'src/features/language/Lang';
import { type NodeValidation, ValidationMask, type ValidationSeverity } from 'src/features/validation';
import { buildNodeValidation, isValidationVisible } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { getVisibilityForNode } from 'src/features/validation/visibility/visibilityUtils';
import { implementsAnyValidation, implementsValidationFilter } from 'src/layout';
import type { ValidationFilterFunction } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ValidationInspectorProps {
  node: LayoutNode;
}

const categories = [
  { name: 'Schema', category: ValidationMask.Schema },
  { name: 'Component', category: ValidationMask.Component },
  { name: 'Expression', category: ValidationMask.Expression },
  { name: 'Custom backend', category: ValidationMask.CustomBackend },
  { name: 'Required', category: ValidationMask.Required },
  { name: 'Standard backend', category: ValidationMask.Backend },
] as const;

export const ValidationInspector = ({ node }: ValidationInspectorProps) => {
  const fieldSelector = Validation.useFieldSelector();
  const componentSelector = Validation.useComponentSelector();
  const visibilitySelector = Validation.useVisibilitySelector();

  if (!implementsAnyValidation(node.def)) {
    return (
      <div style={{ padding: 4 }}>
        <b>{node.item.type}</b> implementerer ikke validering.
      </div>
    );
  }

  const mask = getVisibilityForNode(node, visibilitySelector);
  const filters = implementsValidationFilter(node.def) ? node.def.getValidationFilters(node as any) : [];

  const component = componentSelector(node.item.id, (components) => components[node.item.id]);
  const componentValidations = component?.component?.map((validation) => buildNodeValidation(node, validation));
  const bindingValidations: { [key: string]: NodeValidation[] } = {};
  for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings ?? {})) {
    bindingValidations[bindingKey] = [];

    const fieldValidation = fieldSelector(field, (fields) => fields[field]);
    if (fieldValidation) {
      bindingValidations[bindingKey].push(
        ...fieldValidation.map((validation) => buildNodeValidation(node, validation, bindingKey)),
      );
    }
    if (component?.bindingKeys?.[bindingKey]) {
      bindingValidations[bindingKey].push(
        ...component.bindingKeys[bindingKey].map((validation) => buildNodeValidation(node, validation, bindingKey)),
      );
    }
  }

  return (
    <div style={{ padding: 4 }}>
      <CategoryVisibility mask={mask} />
      <ValidationItems
        binding='Uten datamodell-tilknytning'
        validations={componentValidations}
        node={node}
        mask={mask}
        filters={filters}
      />
      {Object.entries(bindingValidations).map(([binding, validations]) => (
        <ValidationItems
          key={binding}
          binding={binding}
          validations={validations}
          node={node}
          mask={mask}
          filters={filters}
        />
      ))}
    </div>
  );
};

const CategoryVisibility = ({ mask }: { mask: number }) => (
  <>
    <b>Synlige valideringstyper på noden:</b>
    <div className={classes.categoryList}>
      {categories.map(({ name, category }) => {
        const isVisible = (mask & category) > 0;
        return (
          <div
            key={name}
            className={classes.category}
            style={{ backgroundColor: isVisible ? 'lightgreen' : 'lightgray' }}
            title={isVisible ? 'Valideringstypen er synlig' : 'Valideringstypen er skjult'}
          >
            {name}
          </div>
        );
      })}
    </div>
  </>
);

interface ValidationItemsProps {
  binding: string;
  validations: NodeValidation[];
  node: LayoutNode;
  mask: number;
  filters: ValidationFilterFunction[];
}
const ValidationItems = ({ binding, validations, node, mask, filters }: ValidationItemsProps) => {
  if (!validations?.length) {
    return null;
  }

  return (
    <>
      <b>{binding}:</b>
      <ul style={{ padding: 0 }}>
        {validations.map((validation) => (
          <ValidationItem
            key={`${validation.source}-${validation.message.key}-${validation.severity}`}
            validation={validation}
            node={node}
            nodeVisibility={mask}
            filters={filters}
          />
        ))}
      </ul>
    </>
  );
};

interface ValidationItemProps {
  validation: NodeValidation;
  node: LayoutNode;
  nodeVisibility: number;
  filters: ValidationFilterFunction[];
}
const ValidationItem = ({ validation, node, nodeVisibility, filters }: ValidationItemProps) => {
  const color = getColor(validation.severity);

  const isVisible = isValidationVisible(validation, nodeVisibility);
  const category = categories.find((c) => validation.category === c.category);

  const isFiltered = filters.some((filter) => !filter(validation, 0, [validation]));
  return (
    <li
      className={classes.listItem}
      style={{ color, textDecoration: isFiltered ? 'line-through' : 'none' }}
      title={isFiltered ? 'Denne valideringen er filtrert bort' : undefined}
    >
      <div>
        {!isVisible && (
          <EyeSlashIcon
            style={{ marginRight: '6px' }}
            title='Denne valideringen er skjult'
          />
        )}
        <Lang
          id={validation.message.key}
          params={validation.message.params}
          node={node}
        />
      </div>
      {category && (
        <span
          className={classes.listItemCategory}
          style={{ backgroundColor: isVisible ? 'lightgreen' : 'lightgray' }}
          title={isVisible ? 'Valideringstypen er synlig' : 'Valideringstypen er skjult'}
        >
          {category.name}
        </span>
      )}
    </li>
  );
};

function getColor(severity: ValidationSeverity) {
  switch (severity) {
    case 'error':
      return 'red';
    case 'warning':
      return 'orange';
    case 'info':
      return 'blue';
    case 'success':
      return 'green';
  }
}
