import React, { useMemo } from 'react';

import {
  useComponentData,
  useComponentValidation,
  useComponentVisibility,
  useExpression,
} from 'libs/FormEngineReact/hooks';
import type { BaseComponent } from 'libs/FormEngine/types';

export interface FormEngineComponentProps {
  config: BaseComponent;
  parentBinding?: string;
  itemIndex?: number;
  children?: React.ReactNode | ((context: FormEngineComponentContext) => React.ReactNode);
  className?: string;
  'data-testid'?: string;
}

export interface FormEngineComponentContext {
  // Component data
  value: any;
  updateValue: (value: any) => void;

  // Validation
  errors: string[];
  isValid: boolean;
  validate: () => string[];

  // Visibility
  isVisible: boolean;

  // Computed properties
  isRequired: boolean;
  isReadOnly: boolean;

  // Component config
  config: BaseComponent;
  id: string;
  type: string;

  // Context info
  parentBinding?: string;
  itemIndex?: number;
}

/**
 * Higher-order component that provides FormEngine functionality to any component
 */
export function withFormEngine<P extends object>(
  WrappedComponent: React.ComponentType<P & { formEngine: FormEngineComponentContext }>,
) {
  return function FormEngineEnhancedComponent(props: P & FormEngineComponentProps) {
    const { config, parentBinding, itemIndex, ...otherProps } = props;

    // Early return if config is undefined
    if (!config) {
      console.warn('FormEngineEnhancedComponent: config is undefined, rendering nothing');
      return null;
    }

    // Component data binding
    const { value, updateValue } = useComponentData(config, parentBinding, itemIndex);

    // Component validation
    const { errors, isValid, validate } = useComponentValidation(config, parentBinding, itemIndex);

    // Component visibility
    const isVisible = useComponentVisibility(config.id);

    // Evaluate dynamic properties
    const isRequired = useExpression(config.required, [value]);
    const isReadOnly = useExpression(config.readOnly, [value]);

    // Create context object
    const formEngineContext: FormEngineComponentContext = useMemo(
      () => ({
        value,
        updateValue,
        errors,
        isValid,
        validate,
        isVisible,
        isRequired: Boolean(isRequired),
        isReadOnly: Boolean(isReadOnly),
        config,
        id: config.id,
        type: config.type,
        parentBinding,
        itemIndex,
      }),
      [
        value,
        updateValue,
        errors,
        isValid,
        validate,
        isVisible,
        isRequired,
        isReadOnly,
        config,
        parentBinding,
        itemIndex,
      ],
    );

    // Don't render if not visible
    if (!isVisible) {
      return null;
    }

    return (
      <WrappedComponent
        {...(otherProps as P)}
        formEngine={formEngineContext}
      />
    );
  };
}

/**
 * Base FormEngine component that can be used directly
 */
export function FormEngineComponent({
  config,
  parentBinding,
  itemIndex,
  children,
  className,
  ...props
}: FormEngineComponentProps) {
  // Early return if config is undefined
  if (!config) {
    console.warn('FormEngineComponent: config is undefined, rendering nothing');
    return null;
  }

  const { value, updateValue } = useComponentData(config, parentBinding, itemIndex);
  const { errors, isValid } = useComponentValidation(config, parentBinding, itemIndex);
  const isVisible = useComponentVisibility(config.id);
  const isRequired = useExpression(config.required, [value]);
  const isReadOnly = useExpression(config.readOnly, [value]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`form-engine-component ${className || ''}`}
      data-component-id={config.id}
      data-component-type={config.type}
      data-testid={props['data-testid']}
      {...props}
    >
      {/* Render validation errors */}
      {errors.length > 0 && (
        <div
          className='form-engine-errors'
          role='alert'
          aria-live='polite'
        >
          {errors.map((error, index) => (
            <div
              key={index}
              className='form-engine-error'
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Render children with context */}
      {typeof children === 'function'
        ? children({
            value,
            updateValue,
            errors,
            isValid,
            validate: () => [], // Add validate function
            isVisible,
            isRequired: Boolean(isRequired),
            isReadOnly: Boolean(isReadOnly),
            config,
            id: config.id,
            type: config.type,
            parentBinding,
            itemIndex,
          })
        : children}
    </div>
  );
}

/**
 * Hook for getting FormEngine component context
 * Use this inside components wrapped with withFormEngine
 */
export function useFormEngineComponent() {
  // This would be provided by a context if we needed to share between components
  // For now, components get context directly through props
  throw new Error('useFormEngineComponent must be used within a component wrapped with withFormEngine');
}
