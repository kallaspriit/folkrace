import React from "react";

export type FormProps = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;

export const Form: React.FC<FormProps> = ({ method = "post", children, ...rest }) => (
  <form method={method} {...rest}>
    {children}
  </form>
);
