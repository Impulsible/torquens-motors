/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Select, type SelectProps } from '@/components/ui/Select';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface FormSelectProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<SelectProps, 'name'> {
  name: Path<TFieldValues> | string;
  rules?: RegisterOptions<TFieldValues>;
  /** Automatically converts selected option string values to numbers */
  valueAsNumber?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            HELPER: NESTED ERRORS                           */
/* -------------------------------------------------------------------------- */

/**
 * Traverses deep nested object paths (e.g. "specs.transmission" or "packages[0].id")
 */
function getNestedError(errors: Record<string, any>, path: string): string | undefined {
  if (!errors || !path) return undefined;

  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: any = errors;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }

  return current?.message as string | undefined;
}

/* -------------------------------------------------------------------------- */
/*                              FORM SELECT ROOT                              */
/* -------------------------------------------------------------------------- */

export function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  valueAsNumber = false,
  error: customError,
  onChange,
  onBlur,
  disabled,
  ...props
}: FormSelectProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();

  if (!formContext) {
    throw new Error(
      `[FormSelect] Component for field "${name}" must be rendered within a <FormProvider /> context.`
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
  } = formContext;

  // Resolve deep nested error or allow explicit error override
  const fieldError = customError || getNestedError(errors, name);

  // Build registration options with proper typing
  const registrationOptions: RegisterOptions<TFieldValues> = {
    ...rules,
  };

  // Add valueAsNumber if true
  if (valueAsNumber) {
    registrationOptions.valueAsNumber = true as any;
  }

  const {
    ref,
    onChange: rhfOnChange,
    onBlur: rhfOnBlur,
    name: fieldName,
  } = register(name as Path<TFieldValues>, registrationOptions);

  return (
    <Select
      ref={ref}
      name={fieldName}
      error={fieldError}
      disabled={disabled || isSubmitting}
      onChange={(e) => {
        rhfOnChange(e);
        onChange?.(e);
      }}
      onBlur={(e) => {
        rhfOnBlur(e);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

FormSelect.displayName = 'FormSelect';