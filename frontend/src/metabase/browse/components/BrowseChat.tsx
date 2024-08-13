import { useState } from "react";
import { t } from "ttag";
import { color } from "metabase/lib/colors";
import { Button, Flex, Group, Icon, Stack, Title } from "metabase/ui";
import {
  BrowseContainer,
  BrowseHeader,
  BrowseMain,
  BrowseSection,
} from "./BrowseContainer.styled";
import { push } from "react-router-redux";
import { useDispatch } from "react-redux";
import WebSocketHandler from "metabase/query_builder/components/notebook/WebSocketHandler";

export const BrowseChat = () => {
  const [id, setId] = useState<number>(0);
  const dispatch = useDispatch();

  const redirect = () => {
    if (id && id !== 0) {
      dispatch(push(`/question/${id}`));
    }
  };

  return (
    <BrowseContainer>
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
                <Icon size={24} color={color("brand")} name="chat" />
                {t`Chat`}
              </Group>
            </Title>
          </Flex>
        </BrowseSection>
      </BrowseHeader>
      <BrowseMain>
        <BrowseSection>
          <Stack mb="lg" spacing="md" w="100%">
            <WebSocketHandler id={id} setId={setId} />
            {id !== 0 && (
              <Button
                variant="filled"
                disabled={id === 0}
                style={{ minWidth: 100 }}
                onClick={redirect}
              >
                {t`Redirect`}
              </Button>
            )}
          </Stack>
        </BrowseSection>
      </BrowseMain>
    </BrowseContainer>
  );
};
