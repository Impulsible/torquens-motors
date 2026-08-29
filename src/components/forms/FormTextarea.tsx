/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Textarea, type TextareaProps } from '@/components/ui/Textarea';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<TextareaProps, 'name'> {
  name: Path<TFieldValues> | string;
  rules?: RegisterOptions<TFieldValues>;
}

/* -------------------------------------------------------------------------- */
/*                            HELPER: NESTED ERRORS                           */
/* -------------------------------------------------------------------------- */

/**
 * Traverses deep nested object paths (e.g. "provenance.history" or "records[0].notes")
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
/*                              FORM TEXTAREA ROOT                            */
/* -------------------------------------------------------------------------- */

export function FormTextarea<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  error: customError,
  onChange,
  onBlur,
  disabled,
  ...props
}: FormTextareaProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();

  if (!formContext) {
    throw new Error(
      `[FormTextarea] Component for field "${name}" must be rendered within a <FormProvider /> context.`
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
  } = formContext;

  // Resolve deep-nested errors or use manual override
  const fieldError = customError || getNestedError(errors, name);

  const {
    ref,
    onChange: rhfOnChange,
    onBlur: rhfOnBlur,
    name: fieldName,
  } = register(name as Path<TFieldValues>, rules);

  return (
    <Textarea
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

FormTextarea.displayName = 'FormTextarea';