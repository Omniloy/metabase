import { t } from "ttag";

import { color } from "metabase/lib/colors";
import { Flex, Group, Icon, Text, Title } from "metabase/ui";

import { BrowseHeader, BrowseSection } from "./BrowseContainer.styled";

export const BrowseDataHeader = () => {
  return (
    <BrowseHeader>
      <BrowseSection>
        <Flex
          w="100%"
          h="2.25rem"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Title order={1} color="text-dark">
            <Group spacing="sm">
              <Icon size={24} color={"#587330"} name="pie" />
              {t`Raw data`}
            </Group>
          </Title>
        </Flex>
      </BrowseSection>
    </BrowseHeader>
  );
};
