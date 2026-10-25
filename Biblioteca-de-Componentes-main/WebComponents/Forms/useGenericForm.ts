import { useReducer, useCallback } from 'react';

// Tipos base para el estado del formulario genérico
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Set<keyof T>;
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  submitError: string | null;
}

type Action<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: any; errors?: Partial<Record<keyof T, string>> }
  | { type: 'BLUR_FIELD'; field: keyof T; errors?: Partial<Record<keyof T, string>> }
  | { type: 'SUBMIT_START'; errors: Partial<Record<keyof T, string>>; touched: Set<keyof T> }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET'; initialValues: T };

export interface UseGenericFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<{ success: boolean; error?: string }>;
}

export function useGenericForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseGenericFormOptions<T>) {

  const reducer = (state: FormState<T>, action: Action<T>): FormState<T> => {
    switch (action.type) {
      case 'SET_FIELD': {
        const nextValues = { ...state.values, [action.field]: action.value };
        const nextErrors = action.errors ? { ...state.errors, [action.field]: action.errors[action.field] } : state.errors;
        return { ...state, values: nextValues, errors: nextErrors };
      }
      case 'BLUR_FIELD': {
        const nextTouched = new Set(state.touched).add(action.field);
        const nextErrors = action.errors ? { ...state.errors, [action.field]: action.errors[action.field] } : state.errors;
        return { ...state, touched: nextTouched, errors: nextErrors };
      }
      case 'SUBMIT_START':
        return { ...state, errors: action.errors, touched: action.touched, isSubmitting: true, submitStatus: 'idle', submitError: null };
      case 'SUBMIT_SUCCESS':
        return {
          values: initialValues,
          errors: {},
          touched: new Set(),
          isSubmitting: false,
          submitStatus: 'success',
          submitError: null,
        };
      case 'SUBMIT_ERROR':
        return { ...state, isSubmitting: false, submitStatus: 'error', submitError: action.error };
      case 'RESET':
        return {
          values: action.initialValues,
          errors: {},
          touched: new Set(),
          isSubmitting: false,
          submitStatus: 'idle',
          submitError: null,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    values: initialValues,
    errors: {},
    touched: new Set<keyof T>(),
    isSubmitting: false,
    submitStatus: 'idle',
    submitError: null,
  });

  const { values, errors, touched, isSubmitting, submitStatus, submitError } = state;

  const handleChange = useCallback((field: keyof T, value: any) => {
    let newErrors: Partial<Record<keyof T, string>> | undefined;
    if (state.touched.has(field) && validate) {
      newErrors = validate({ ...state.values, [field]: value });
    }
    dispatch({ type: 'SET_FIELD', field, value, errors: newErrors });
  }, [state.touched, state.values, validate]);

  const handleBlur = useCallback((field: keyof T) => {
    const newErrors = validate ? validate(state.values) : {};
    dispatch({ type: 'BLUR_FIELD', field, errors: newErrors });
  }, [state.values, validate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const validationErrors = validate ? validate(values) : {};
    const newTouched = new Set(Object.keys(values) as Array<keyof T>);

    dispatch({ type: 'SUBMIT_START', errors: validationErrors, touched: newTouched });
    
    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: 'SUBMIT_ERROR', error: 'Por favor, corrige los errores marcados.' });
      return;
    }

    try {
      const result = await onSubmit(values);

      if (result.success) {
        dispatch({ type: 'SUBMIT_SUCCESS' });
      } else {
        dispatch({ type: 'SUBMIT_ERROR', error: result.error || 'Error al procesar la solicitud.' });
      }
    } catch {
      dispatch({ type: 'SUBMIT_ERROR', error: 'Error inesperado. Intenta de nuevo.' });
    }
  };

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET', initialValues });
  }, [initialValues]);

  const inputProps = (field: keyof T) => ({
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      handleChange(field, e.target.value),
    onBlur: () => handleBlur(field),
    'aria-invalid': touched.has(field) && !!errors[field],
    'aria-describedby': touched.has(field) && errors[field]
      ? `${String(field)}-error`
      : undefined,
  });

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitStatus,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    inputProps,
    setFieldValue: handleChange, // Alias muy usado en formik/react-hook-form
  };
}
