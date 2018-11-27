import { styled } from "../styled";

export interface ViewProps {
  text?: boolean;
  grid?: boolean;
}

export const View = styled.div<ViewProps>`
  position: relative;
  flex: 1;
  border-radius: 8px 8px 0 0;
  padding: ${props =>
    props.text ? "16px" : props.grid ? props.theme.size.gridGap : "0"};
`;
