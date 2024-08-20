import styled from "@emotion/styled";
import { Ellipsified } from "metabase/core/components/Ellipsified";
import { color } from "metabase/lib/colors";
import { Icon } from "metabase/ui";

// Updated styles for the card layout
export const CardContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  width: 100%;
  flex: 1 1 30%;
  margin: 0 8px;
`;

export const CardIcon = styled(Icon)`
  background-color: #eef3ff;
  padding: 8px;
  border-radius: 50%;
  color: ${() => color("accent4")};
  flex-shrink: 0;
`;

export const CardTitle = styled(Ellipsified)`
  margin-left: 16px;
  display: flex;
  flex-direction: column;
`;

export const CardTitlePrimary = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: var(--mb-color-text-dark);
`;

export const CardTitleSecondary = styled.span`
  font-size: 14px;
  color: var(--mb-color-text-medium);
  margin-top: 4px;
`;
