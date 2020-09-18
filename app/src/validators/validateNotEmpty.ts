export const validateNotEmpty = () => (value: string) => {
  if (value === "") {
    return "This field is required";
  }

  return true;
};
