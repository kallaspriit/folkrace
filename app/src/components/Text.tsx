import { styled } from "../styled";

export interface TextProps {
  primary?: boolean;
}

export const Text = styled.div<TextProps>`
  text-align: center;
  font-variant: ${props => (props.primary ? "all-small-caps" : "normal")};
  line-height: 1.2em;
`;
