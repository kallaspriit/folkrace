export const validateMaximumLength = (maximumLength: number, message?: string) => (value: string) => {
  const isValid = value.length <= maximumLength;

  if (!isValid) {
    return message ?? `Can not be longer than ${maximumLength} characters`;
  }

  return true;
};
