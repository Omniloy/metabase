import type { MouseEvent } from "react";
import { useCallback, useMemo } from "react";
import { t } from "ttag";
import _ from "underscore";

import ErrorBoundary from "metabase/ErrorBoundary";
import { useUserSetting } from "metabase/common/hooks";
import { useHasTokenFeature } from "metabase/common/hooks/use-has-token-feature";
import { useIsAtHomepageDashboard } from "metabase/common/hooks/use-is-at-homepage-dashboard";
import TippyPopoverWithTrigger from "metabase/components/PopoverWithTrigger/TippyPopoverWithTrigger";
import { Tree } from "metabase/components/tree";
import {
  getCollectionIcon,
  PERSONAL_COLLECTIONS,
} from "metabase/entities/collections";
import { isSmallScreen } from "metabase/lib/dom";
import { useSelector } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { WhatsNewNotification } from "metabase/nav/components/WhatsNewNotification";
import { UploadCSV } from "metabase/nav/containers/MainNavbar/SidebarItems/UploadCSV";
import { getSetting } from "metabase/selectors/settings";
import type { IconName, IconProps } from "metabase/ui";
import type { Bookmark, Collection, User } from "metabase-types/api";

import {
  AddYourOwnDataLink,
  CollectionMenuList,
  CollectionsMoreIcon,
  CollectionsMoreIconContainer,
  PaddedSidebarLink,
  SidebarContentRoot,
  SidebarHeading,
  SidebarHeadingWrapper,
  SidebarSection,
  TrashSidebarSection,
} from "../MainNavbar.styled";
import { SidebarCollectionLink, SidebarLink } from "../SidebarItems";
import type { SelectedItem } from "../types";

import BookmarkList from "./BookmarkList";
import { BrowseNavSection } from "./BrowseNavSection";
import { useListDashboardsQuery } from "metabase/api";

interface CollectionTreeItem extends Collection {
  icon: IconName | IconProps;
  children: CollectionTreeItem[];
}
type Props = {
  isAdmin: boolean;
  isOpen: boolean;
  currentUser: User;
  bookmarks: Bookmark[];
  hasDataAccess: boolean;
  hasOwnDatabase: boolean;
  collections: CollectionTreeItem[];
  selectedItems: SelectedItem[];
  handleCloseNavbar: () => void;
  handleLogout: () => void;
  handleCreateNewCollection: () => void;
  reorderBookmarks: ({
    newIndex,
    oldIndex,
  }: {
    newIndex: number;
    oldIndex: number;
  }) => Promise<any>;
};
const OTHER_USERS_COLLECTIONS_URL = Urls.otherUsersPersonalCollections();
const ADD_YOUR_OWN_DATA_URL = "/admin/databases/create";
const BROWSE_DATA_URL = "/browse/databases";
const BROWSE_MODELS_URL = "/browse/models";
const BROWSE_CHAT = "/browse/chat";
const BROWSE_SEMANTIC_LAYER = "/browse/semantic-layer";
const BROWSE_LIBRARY = "/collection/2-library"

function MainNavbarView({
  isAdmin,
  currentUser,
  bookmarks,
  collections,
  hasOwnDatabase,
  selectedItems,
  hasDataAccess,
  reorderBookmarks,
  handleCreateNewCollection,
  handleCloseNavbar,
}: Props) {
  const [expandBookmarks = true, setExpandBookmarks] = useUserSetting(
    "expand-bookmarks-in-nav",
  );

  const isAtHomepageDashboard = useIsAtHomepageDashboard();
  const { data: dashboards, status } = useListDashboardsQuery();
  const {
    card: cardItem,
    collection: collectionItem,
    dashboard: dashboardItem,
    "non-entity": nonEntityItem,
  } = _.indexBy(selectedItems, item => item.type);

  const onItemSelect = useCallback(() => {
    if (isSmallScreen()) {
      handleCloseNavbar();
    }
  }, [handleCloseNavbar]);

  const handleHomeClick = useCallback(
    (event: MouseEvent) => {
      // Prevent navigating to the dashboard homepage when a user is already there
      // https://github.com/metabase/metabase/issues/43800
      if (isAtHomepageDashboard) {
        event.preventDefault();
      }
      onItemSelect();
    },
    [isAtHomepageDashboard, onItemSelect],
  );

  // Can upload CSVs if
  // - properties.token_features.attached_dwh === true
  // - properties.uploads-settings.db_id exists
  // - retrieve collection using properties.uploads-settings.db_id
  const hasAttachedDWHFeature = useHasTokenFeature("attached_dwh");
  const uploadDbId = useSelector(
    state => getSetting(state, "uploads-settings")?.db_id,
  );
  const rootCollection = collections.find(
    ({ id, can_write }) => (id === null || id === "root") && can_write,
  );

  const [[trashCollection], collectionsWithoutTrash] = useMemo(
    () => _.partition(collections, c => c.type === "trash"),
    [collections],
  );

  return (
    <ErrorBoundary>
      <SidebarContentRoot>
        <div>
          <SidebarSection>
            <PaddedSidebarLink
              isSelected={nonEntityItem?.url === "/"}
              icon="home"
              onClick={handleHomeClick}
              url="/"
            >
              {t`Home`}
            </PaddedSidebarLink>

            {hasAttachedDWHFeature && uploadDbId && rootCollection && (
              <UploadCSV collection={rootCollection} />
            )}
            {hasDataAccess && (
              <PaddedSidebarLink
                icon="database"
                url={BROWSE_DATA_URL}
                isSelected={nonEntityItem?.url?.startsWith(BROWSE_DATA_URL)}
                onClick={onItemSelect}
              >
                {t`Raw Data`}
              </PaddedSidebarLink>
            )}
            {hasDataAccess && (
              <PaddedSidebarLink
                icon="database"
                url={BROWSE_SEMANTIC_LAYER}
                isSelected={nonEntityItem?.url?.startsWith(BROWSE_SEMANTIC_LAYER)}
                onClick={onItemSelect}
                aria-label={t`Browse semantic layer`}
              >
                {t`OmniAI layer`}
              </PaddedSidebarLink>
            )}
            <PaddedSidebarLink
              icon="collection"
              url={BROWSE_LIBRARY}
              isSelected={nonEntityItem?.url?.startsWith(BROWSE_LIBRARY)}
              onClick={onItemSelect}
              aria-label={t`Library`}
            >
              {t`Library`}
            </PaddedSidebarLink>
            <PaddedSidebarLink
              icon="chat"
              url={BROWSE_CHAT}
              isSelected={nonEntityItem?.url?.startsWith(BROWSE_CHAT)}
              onClick={onItemSelect}
              aria-label={t`Ask Omni`}
            >
              {t`Ask Omni`}
            </PaddedSidebarLink>
            <>



            </>
          </SidebarSection>
          {bookmarks.length > 0 && (
            <SidebarSection>
              <ErrorBoundary>
                <BookmarkList
                  bookmarks={bookmarks}
                  selectedItem={cardItem ?? dashboardItem ?? collectionItem}
                  onSelect={onItemSelect}
                  reorderBookmarks={reorderBookmarks}
                  onToggle={setExpandBookmarks}
                  initialState={expandBookmarks ? "expanded" : "collapsed"}
                />
              </ErrorBoundary>
            </SidebarSection>
          )}

          <SidebarSection>
            <ErrorBoundary>
              <CollectionSectionHeading
                currentUser={currentUser}
                handleCreateNewCollection={handleCreateNewCollection}
              />
              <>
                {dashboards!.map((dashboard) => (
                  <PaddedSidebarLink
                    key={dashboard.id}
                    icon="dashboard"
                    url={`/dashboard/${dashboard.id}`}
                    onClick={onItemSelect}
                    isSelected={dashboardItem?.id === dashboard.id} // Seleccionar si es el dashboard actual
                  >
                    {dashboard.name}
                  </PaddedSidebarLink>
                ))}

              </>
              {/*<Tree
                data={collectionsWithoutTrash}
                selectedId={collectionItem?.id}
                onSelect={onItemSelect}
                TreeNode={SidebarCollectionLink}
                role="tree"
                aria-label="collection-tree"
              />*/}
            </ErrorBoundary>
          </SidebarSection>

          {/*<SidebarSection>
            <ErrorBoundary>
              <BrowseNavSection
                nonEntityItem={nonEntityItem}
                onItemSelect={onItemSelect}
                hasDataAccess={hasDataAccess}
              />
              {hasDataAccess && (
                <>
                  {!hasOwnDatabase && isAdmin && (
                    <AddYourOwnDataLink
                      icon="add"
                      url={ADD_YOUR_OWN_DATA_URL}
                      isSelected={nonEntityItem?.url?.startsWith(
                        ADD_YOUR_OWN_DATA_URL,
                      )}
                      onClick={onItemSelect}
                    >
                      {t`Add your own data`}
                    </AddYourOwnDataLink>
                  )}
                </>
              )}
            </ErrorBoundary>
          </SidebarSection>
          */}
        </div>
        <WhatsNewNotification />
      </SidebarContentRoot>
    </ErrorBoundary>
  );
}
interface CollectionSectionHeadingProps {
  currentUser: User;
  handleCreateNewCollection: () => void;
}
function CollectionSectionHeading({
  currentUser,
  handleCreateNewCollection,
}: CollectionSectionHeadingProps) {
  const renderMenu = useCallback(
    ({ closePopover }: { closePopover: () => void }) => (
      <CollectionMenuList>
        <SidebarLink
          icon="add"
          onClick={() => {
            closePopover();
            handleCreateNewCollection();
          }}
        >
          {t`New Dashboard`}
        </SidebarLink>
        {currentUser.is_superuser && (
          <SidebarLink
            icon={
              getCollectionIcon(
                PERSONAL_COLLECTIONS as Collection,
              ) as unknown as IconName
            }
            url={OTHER_USERS_COLLECTIONS_URL}
            onClick={closePopover}
          >
            {t`Other users' personal collections`}
          </SidebarLink>
        )}
      </CollectionMenuList>
    ),
    [currentUser, handleCreateNewCollection],
  );

  return (
    <SidebarHeadingWrapper>
      <SidebarHeading>{t`Dashboard`}</SidebarHeading>
      <CollectionsMoreIconContainer>
        <TippyPopoverWithTrigger
          renderTrigger={({ onClick }) => (
            <CollectionsMoreIcon name="ellipsis" onClick={onClick} />
          )}
          popoverContent={renderMenu}
        />
      </CollectionsMoreIconContainer>
    </SidebarHeadingWrapper>
  );
}
// eslint-disable-next-line import/no-default-export -- deprecated usage
export default MainNavbarView;
