/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

import { Input, type InputProps } from '@/components/ui/Input';
import { Textarea, type TextareaProps } from '@/components/ui/Textarea';
import { Select, type SelectProps } from '@/components/ui/Select';

/* -------------------------------------------------------------------------- */
/*                            HELPER: NESTED ERRORS                           */
/* -------------------------------------------------------------------------- */

/**
 * Resolves deep nested errors (e.g. "specs.engine.horsepower" or "gallery[0].url")
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
/*                                 FORM INPUT                                 */
/* -------------------------------------------------------------------------- */

export interface FormInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<InputProps, 'name'> {
  name: Path<TFieldValues> | string;
  rules?: RegisterOptions<TFieldValues>;
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  valueAsNumber,
  valueAsDate,
  type,
  error: customError,
  onChange,
  onBlur,
  disabled,
  ...props
}: FormInputProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();

  if (!formContext) {
    throw new Error(
      `[FormInput] Component for "${name}" must be rendered within a <FormProvider /> context.`
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
  } = formContext;

  // Resolve deep nested error or allow explicit error override
  const fieldError = customError || getNestedError(errors, name);

  // Configure registration options - handle valueAsNumber and valueAsDate separately
  const registrationOptions: RegisterOptions<TFieldValues> = {
    ...rules,
  };

  // Add valueAsNumber if true and not already set
  if (valueAsNumber || (valueAsNumber === undefined && type === 'number')) {
    registrationOptions.valueAsNumber = true as any;
  }

  // Add valueAsDate if true and not already set
  if (valueAsDate || (valueAsDate === undefined && type === 'date')) {
    registrationOptions.valueAsDate = true as any;
  }

  const { ref, onChange: rhfOnChange, onBlur: rhfOnBlur, name: fieldName } = register(
    name as Path<TFieldValues>,
    registrationOptions
  );

  return (
    <Input
      ref={ref}
      name={fieldName}
      type={type}
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

FormInput.displayName = 'FormInput';


/* -------------------------------------------------------------------------- */
/*                                FORM TEXTAREA                               */
/* -------------------------------------------------------------------------- */

export interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<TextareaProps, 'name'> {
  name: Path<TFieldValues> | string;
  rules?: RegisterOptions<TFieldValues>;
}

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
      `[FormTextarea] Component for "${name}" must be rendered within a <FormProvider /> context.`
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
  } = formContext;

  const fieldError = customError || getNestedError(errors, name);
  const { ref, onChange: rhfOnChange, onBlur: rhfOnBlur, name: fieldName } = register(
    name as Path<TFieldValues>,
    rules
  );

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


/* -------------------------------------------------------------------------- */
/*                                 FORM SELECT                                */
/* -------------------------------------------------------------------------- */

export interface FormSelectProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<SelectProps, 'name'> {
  name: Path<TFieldValues> | string;
  rules?: RegisterOptions<TFieldValues>;
}

export function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  error: customError,
  onChange,
  onBlur,
  disabled,
  ...props
}: FormSelectProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();

  if (!formContext) {
    throw new Error(
      `[FormSelect] Component for "${name}" must be rendered within a <FormProvider /> context.`
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
  } = formContext;

  const fieldError = customError || getNestedError(errors, name);
  const { ref, onChange: rhfOnChange, onBlur: rhfOnBlur, name: fieldName } = register(
    name as Path<TFieldValues>,
    rules
  );

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