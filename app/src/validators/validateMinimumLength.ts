export const validateMinimumLength = (minimumLength: number, message?: string) => (value: string) => {
  const isValid = value.length >= minimumLength;

  if (!isValid) {
    return message ?? `Expected at least ${minimumLength} characters`;
  }

  return true;
};
