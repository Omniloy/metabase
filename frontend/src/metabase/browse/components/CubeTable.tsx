import {
  type PropsWithChildren,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { t } from "ttag";
import EntityItem from "metabase/components/EntityItem";
import { SortableColumnHeader } from "metabase/components/ItemsTable/BaseItemsTable";
import {
  ItemNameCell,
  MaybeItemLink,
  Table,
  TableColumn,
  TBody,
} from "metabase/components/ItemsTable/BaseItemsTable.styled";
import { Columns } from "metabase/components/ItemsTable/Columns";
import type { ResponsiveProps } from "metabase/components/ItemsTable/utils";
import { Ellipsified } from "metabase/core/components/Ellipsified";
import { color } from "metabase/lib/colors";
import { useSelector } from "metabase/lib/redux";
import { getLocale } from "metabase/setup/selectors";
import {
  Flex,
  Icon,
  type IconProps,
  type IconName,
  Skeleton,
} from "metabase/ui";
import { Repeat } from "metabase/ui/components/feedback/Skeleton/Repeat";
import { SortDirection, type SortingOptions } from "metabase-types/api/sorting";
import { CollectionsIcon } from "./CollectionBreadcrumbsWithTooltip.styled";
import {
  ModelCell,
  ModelNameColumn,
  ModelTableRow,
  ActionSpan,
} from "./ModelsTable.styled";
import { CubeDataItem } from "metabase-types/api";
import { CubeDialog } from "metabase/components/Cube/CubeDialog";
import { sortDefinitionData } from "./utils";

export interface CubeTableProps {
  cubeData: CubeDataItem;
  skeleton?: boolean;
  isValidation: boolean; // Added isValidation prop
  handleSemanticView: () => void;
  onUpdateCube: (updatedCube: CubeResult) => void;
  isValidateFilter?: any;
  questionFilter?: any;
  userFilter?: any; // Add userFilter prop
  cubeRequests: any;
}

export interface CubeResult {
  category: string;
  name: string; // Updated to use 'name' instead of 'title' for the Name column
  type: string;
  title: string;
  sql?: string;
  primaryKey: boolean;
  description: string;
  verified_status?: boolean;
  in_semantic_layer?: boolean;
  user?: string;
  admin_user?: string;
  updated_at?: string;
}

export const itemsTableContainerName = "ItemsTableContainer";

type Meta = {
  verified_status: boolean;
  in_semantic_layer: boolean;
  user: string;
  admin_user: string;
  updated_at: string;
};

type Measure = {
  sql?: string;
  type: string;
  title?: string;
  description?: string;
  primaryKey?: boolean;
  meta?: Meta;
};

type Dimension = Measure;
type Joins = Measure;

type Cube = {
  title: string;
  description: string;
  sql: string;
  measures?: Record<string, Measure>;
  dimensions?: Record<string, Dimension>;
  joins?: Record<string, Joins>;
};

const descriptionProps: ResponsiveProps = {
  hideAtContainerBreakpoint: "sm",
  containerName: itemsTableContainerName,
};

const collectionProps: ResponsiveProps = {
  hideAtContainerBreakpoint: "xs",
  containerName: itemsTableContainerName,
};

const DEFAULT_SORTING_OPTIONS: SortingOptions = {
  sort_column: "title",
  sort_direction: SortDirection.Asc,
};

const LARGE_DATASET_THRESHOLD = 500;

export const CubeTable = ({
  cubeData,
  skeleton = false,
  isValidation,
  handleSemanticView,
  onUpdateCube,
  questionFilter = "", // Receive questionFilter prop
  isValidateFilter = "", // Receive isValidateFilter prop
  userFilter = "",
  cubeRequests,
}: CubeTableProps) => {
  const locale = useSelector(getLocale);
  const localeCode: string | undefined = locale?.code;
  const [selectedDefinition, setSelectedDefinition] =
    useState<CubeResult | null>();
  const [noMatched, setNoMatched] = useState<boolean>(false);
  const isLargeDataset = 100 > LARGE_DATASET_THRESHOLD;

  const [showLoadingManyRows, setShowLoadingManyRows] =
    useState(isLargeDataset);

  const [sortingOptions, setSortingOptions] = useState<SortingOptions>(
    DEFAULT_SORTING_OPTIONS,
  );

  const typesWithParts = extractParts(cubeData.content as string);
  const parsedData = cleanAndParseInputString(cubeData.content as string);
  const typesWithSql = extractPartsWithSql(parsedData);
  const [updatedTypesWithSql, setUpdatedTypesWithSql] = useState(typesWithSql); // Initialize with typesWithSql

  useEffect(() => {
    let foundNoMatch = false;

    const updatedData =
      cubeRequests && cubeRequests.length > 0
        ? typesWithSql.map(typeWithSql => {
            const matchingCubeRequest = cubeRequests.find(
              (cubeRequest: any) =>
                cubeRequest.description === typeWithSql.description,
            );

            if (matchingCubeRequest) {
              return {
                ...typeWithSql,
                user: matchingCubeRequest.user,
                admin_user: matchingCubeRequest.admin_user,
                updated_at: matchingCubeRequest.updated_at,
                verified_status: matchingCubeRequest.verified_status,
                in_semantic_layer: matchingCubeRequest.in_semantic_layer,
              };
            }

            foundNoMatch = true; // No match found
            return typeWithSql;
          })
        : typesWithSql;

    // Only update state if the data has changed
    if (JSON.stringify(updatedTypesWithSql) !== JSON.stringify(updatedData)) {
      setUpdatedTypesWithSql(updatedData);
      setNoMatched(foundNoMatch);
    }
  }, [cubeRequests, typesWithSql]);

  // Updated filter definitions based on `isValidation` flag and input filters
  const filteredDefinitions = updatedTypesWithSql.filter(definition => {
    // Skip filtering if cubeRequests is empty
    if (!cubeRequests || cubeRequests.length === 0 || noMatched) {
      return true; // Return all `typesWithSql` when there are no cubeRequests
    }

    const matchesQuestion = questionFilter
      ? definition.description
          .toLowerCase()
          .includes(questionFilter.toLowerCase())
      : true;

    const matchesIsValidate = isValidateFilter
      ? String(definition.verified_status) // Convert boolean to string
          .toLowerCase()
          .includes(isValidateFilter.toLowerCase()) // Use includes for partial matching
      : true;

    const matchesUser = userFilter
      ? definition.user?.toLowerCase().includes(userFilter.toLowerCase()) // Filter by user if userFilter is provided
      : true;

    // Only include items with verified_status true when isValidation is false
    const matchesVerifiedStatus =
      isValidation || definition.verified_status === true;

    return (
      matchesQuestion &&
      matchesIsValidate &&
      matchesUser &&
      matchesVerifiedStatus
    );
  });

  const sortedDefinitions = sortDefinitionData(
    filteredDefinitions,
    sortingOptions,
    localeCode,
  );

  const collectionWidth = 20;
  const descriptionWidth = 100 - collectionWidth - (isValidation ? 40 : 0); // Adjust width when validation columns are present

  const handleRowClick = (cube: CubeResult) => {
    setSelectedDefinition(cube);
  };

  const handleCloseModal = () => {
    setSelectedDefinition(null);
  };

  const handleUpdateSortOptions = skeleton
    ? undefined
    : (newSortingOptions: SortingOptions) => {
        if (isLargeDataset) {
          setShowLoadingManyRows(true);
        }
        setSortingOptions(newSortingOptions);
      };

  useEffect(() => {
    if (isLargeDataset && showLoadingManyRows) {
      setTimeout(() => setShowLoadingManyRows(false), 10);
    }
  }, [isLargeDataset, showLoadingManyRows, sortedDefinitions]);

  return (
    <>
      <Table aria-label={skeleton ? undefined : "Table of models"}>
        <colgroup>
          {/* <col> for Name column */}
          {!isValidation && (
            <>
              <ModelNameColumn containerName={itemsTableContainerName} />
              <TableColumn {...collectionProps} width={`20%`} />
            </>
          )}
          {/* <col> for Collection column */}
          {/* <col> for Description column */}
          <TableColumn {...descriptionProps} width={`${descriptionWidth}%`} />
          <TableColumn
            {...descriptionProps}
            width={isValidation ? "10%" : "30%"}
          />
          {/* Conditionally render columns for Verified Status, In Semantic Layer, and Action */}
          {isValidation && (
            <>
              <TableColumn {...descriptionProps} width={`10%`} />{" "}
              <TableColumn {...descriptionProps} width={`15%`} />{" "}
              <TableColumn {...descriptionProps} width={`10%`} />{" "}
              <TableColumn {...descriptionProps} width={`10%`} />{" "}
              <TableColumn {...descriptionProps} width={`5%`} />{" "}
              {/* Action column */}
            </>
          )}
          <Columns.RightEdge.Col />
        </colgroup>
        <thead>
          <tr>
            {!isValidation ? (
              <>
                <SortableColumnHeader
                  name="title"
                  sortingOptions={sortingOptions}
                  onSortingOptionsChange={handleUpdateSortOptions}
                  style={{ paddingInlineStart: ".625rem" }}
                  columnHeaderProps={{
                    style: { paddingInlineEnd: ".5rem" },
                  }}
                >
                  {t`Name`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="type"
                  {...collectionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  <Ellipsified>{t`Type`}</Ellipsified>
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="category"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Description`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="category"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Category`}
                </SortableColumnHeader>
              </>
            ) : (
              <>
                <SortableColumnHeader
                  name="category"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Description`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="user"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`User`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="admin_user"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Admin User`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="updated_at"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Last Update`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="verified_status"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Verified Status`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="in_semantic_layer"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`In Semantic Layer`}
                </SortableColumnHeader>
                <SortableColumnHeader
                  name="action"
                  {...descriptionProps}
                  columnHeaderProps={{
                    style: {
                      paddingInline: ".5rem",
                    },
                  }}
                >
                  {t`Action`}
                </SortableColumnHeader>
              </>
            )}

            <Columns.RightEdge.Header />
          </tr>
        </thead>
        <TBody>
          {showLoadingManyRows ? (
            <TableLoader />
          ) : skeleton ? (
            <Repeat times={7}>
              <TBodyRowSkeleton />
            </Repeat>
          ) : (
            sortedDefinitions.map((cube: CubeResult) => (
              <TBodyRow
                cube={cube}
                key={cube.name}
                handleRowClick={handleRowClick}
                isValidation={isValidation} // Pass the isValidation prop to TBodyRow
              />
            ))
          )}
        </TBody>
      </Table>
      {selectedDefinition && (
        <CubeDialog
          isOpen={!!selectedDefinition}
          onClose={handleCloseModal}
          cube={selectedDefinition}
          isValidationTable={isValidation}
          handleSemanticView={handleSemanticView}
          onUpdateCube={onUpdateCube}
        />
      )}
    </>
  );
};

const TBodyRow = ({
  cube,
  skeleton,
  handleRowClick,
  isValidation, // Receive the isValidation prop
}: {
  cube: CubeResult;
  skeleton?: boolean;
  handleRowClick: any;
  isValidation: boolean; // Define isValidation prop type
}) => {
  // Determine the Action column value
  const actionValue = cube.verified_status === true ? "Done" : "Pending";
  const icon = { name: "model" as IconName }; // Define the icon for reuse

  return (
    <ModelTableRow
      onClick={(e: React.MouseEvent) => {
        if (skeleton) {
          return;
        }
        handleRowClick(cube);
      }}
      tabIndex={0}
      key={cube.name}
    >
      {!isValidation ? (
        <>
          <NameCell cube={cube}>
            <EntityItem.Name name={cube.name} variant="list" />{" "}
            {/* Updated to use 'name' */}
          </NameCell>
          <ModelCell {...collectionProps}>{cube.type}</ModelCell>
          <ModelCell {...descriptionProps}>{cube.description}</ModelCell>
          <ModelCell {...descriptionProps}>{cube.category}</ModelCell>
        </>
      ) : (
        <>
          <DescriptionCell
            cube={cube}
            isValidation={isValidation}
            icon={icon} // Pass the icon for the folder
          />
          <ModelCell {...descriptionProps}>{cube.user}</ModelCell>
          <ModelCell {...descriptionProps}>{cube.admin_user}</ModelCell>
          <ModelCell {...descriptionProps}>{cube.updated_at}</ModelCell>
          <ModelCell {...descriptionProps}>
            {cube.verified_status ? "True" : "False"}
          </ModelCell>
          <ModelCell {...descriptionProps}>
            {cube.in_semantic_layer ? "True" : "False"}
          </ModelCell>
          <ModelCell {...descriptionProps}>
            <ActionSpan isDone={actionValue === "Done"}>
              {actionValue}
            </ActionSpan>
          </ModelCell>
          {/* Action column */}
        </>
      )}

      <Columns.RightEdge.Cell />
    </ModelTableRow>
  );
};

const DescriptionCell = ({
  cube,
  isValidation,
  testIdPrefix = "table",
  icon,
}: PropsWithChildren<{
  cube?: CubeResult;
  isValidation: boolean;
  testIdPrefix?: string;
  icon?: IconProps;
}>) => {
  const headingId = `model-${cube?.name || "dummy"}-description`;

  return (
    <ItemNameCell
      data-testid={`${testIdPrefix}-description`}
      aria-labelledby={headingId}
    >
      <MaybeItemLink
        style={{
          paddingInlineStart: "1.4rem",
          paddingInlineEnd: ".5rem",
        }}
      >
        {isValidation && icon && (
          <Icon
            size={16}
            {...icon}
            color={color("brand")}
            style={{ flexShrink: 0 }}
          />
        )}
        <EntityItem.Name
          name={cube?.description || ""}
          variant="list"
          id={headingId}
        />
      </MaybeItemLink>
    </ItemNameCell>
  );
};

const NameCell = ({
  cube,
  testIdPrefix = "table",
  icon,
}: PropsWithChildren<{
  cube?: CubeResult;
  testIdPrefix?: string;
  icon?: IconProps;
}>) => {
  const headingId = `model-${cube?.name || "dummy"}-heading`;
  return (
    <ItemNameCell
      data-testid={`${testIdPrefix}-name`}
      aria-labelledby={headingId}
    >
      <MaybeItemLink
        style={{
          paddingInlineStart: "1.4rem",
          paddingInlineEnd: ".5rem",
        }}
      >
        {icon && (
          <Icon
            size={16}
            {...icon}
            color={color("brand")}
            style={{ flexShrink: 0 }}
          />
        )}
        <CollectionsIcon name="folder" />
        <EntityItem.Name
          name={cube?.name || ""}
          variant="list"
          id={headingId}
        />
      </MaybeItemLink>
    </ItemNameCell>
  );
};

const TableLoader = () => (
  <tr>
    <td colSpan={4}>
      <Flex justify="center" color="text-light">
        {t`Loading…`}
      </Flex>
    </td>
  </tr>
);

const CellTextSkeleton = () => {
  return <Skeleton natural h="16.8px" />;
};

export const extractParts = (inputString: string) => {
  const regex =
    /(measures|dimensions):\s*{(?:[^}]*?(\w+):\s*{[^}]*?type:\s*`(\w+)`[^}]*?(?:title:\s*`([^`]+)`)?[^}]*?(?:description:\s*`([^`]+)`)?[^}]*?})+/g;
  const results = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    const category = match[1];
    const innerMatches = match[0].matchAll(
      /(\w+):\s*{[^}]*?type:\s*`(\w+)`(?:[^}]*?title:\s*`([^`]+)`)?(?:[^}]*?description:\s*`([^`]+)`)?[^}]*?}/g,
    );
    for (const innerMatch of innerMatches) {
      results.push({
        category,
        name: innerMatch[1],
        type: innerMatch[2],
        title: innerMatch[3] || "",
        description: innerMatch[4] || "",
      });
    }
  }

  return results;
};

const cleanAndParseInputString = (inputString: string): Cube | null => {
  console.log("🚀 ~ extractParts ~ inputString:", inputString);
  let cleanedString = inputString;

  // Step 1: Remove single-line comments starting with //
  const commentRegex = /\/\/.*$/gm;
  cleanedString = cleanedString.replace(commentRegex, "");

  // Step 2: Remove all redundant cube(...) wrappers using a comprehensive regex
  const redundantCubeRegex =
    /cube\(["'`][^"'`]+["'`],\s*cube\(["'`][^"'`]+["'`],\s*{/g;
  cleanedString = cleanedString.replace(redundantCubeRegex, "");

  // Step 3: Remove the outermost "cube(`...`, {" at the beginning and the ")" at the end
  cleanedString = cleanedString
    .replace(/^cube\(["'`][^"'`]+["'`],\s*{/, "{")
    .replace(/\);\s*$/, "}");

  // Step 4: Remove any "cube(...)" that appears within the first part of the cleaned string
  cleanedString = cleanedString.replace(/{\s*cube\(["'`][^"'`]+["'`],/g, "{");

  // Step 5: Preserve multi-line SQL statements by matching content between `sql: and `} for multi-line support
  const multiLineSqlRegex = /sql:\s*`([^`]+)`/g;
  cleanedString = cleanedString.replace(
    multiLineSqlRegex,
    (match, sqlContent) => {
      // Convert multi-line SQL back into a single line while preserving indentation for readability
      const singleLineSql = sqlContent.replace(/\s+/g, " ").trim();
      return `sql: \`${singleLineSql}\``;
    },
  );

  // Step 6: Replace backticks with double quotes for JSON compatibility
  cleanedString = cleanedString.replace(/`/g, '"');

  // Step 7: Ensure all property names are in double quotes (including those that might not have been handled correctly)
  cleanedString = cleanedString.replace(/(\w+):/g, '"$1":');

  // Step 8: Ensure boolean values are correctly formatted (not wrapped in quotes)
  cleanedString = cleanedString.replace(/:\s*(true|false)\s*(,?)/g, ": $1$2");

  // Step 9: Correct improperly quoted DATE_TRUNC expressions and remove stray commas
  cleanedString = cleanedString.replace(
    /"DATE_TRUNC\('(\w+)',\s*\${CUBE}\.(\w+)'\)"/g,
    "DATE_TRUNC('$1', ${CUBE}.$2)",
  );

  // Step 10: Remove stray commas inside SQL expressions
  cleanedString = cleanedString.replace(/,\s*\.(\w+)/g, ".$1");

  // Step 11: Remove trailing commas within property values and after property values
  cleanedString = cleanedString.replace(/,\s*([}\]])/g, "$1");

  // Step 12: Ensure primaryKey is treated as a boolean and correctly formatted
  cleanedString = cleanedString.replace(
    /(?<=\s|,|{)"?primaryKey"?\s*:\s*"?(\w+)"?\s*(,?)/g,
    '"primaryKey": $1$2',
  );

  // Step 13: Remove any remaining trailing commas from the end of objects
  cleanedString = cleanedString.replace(/,\s*([}\]])/g, "$1");

  // Step 14: Ensure only one closing brace at the end of the JSON
  cleanedString = cleanedString.trim();
  if (cleanedString.endsWith("}}")) {
    cleanedString = cleanedString.slice(0, -1);
  }

  // Step 15: Ensure the cleaned string starts with a '{' to form a valid JSON object
  if (!cleanedString.trim().startsWith("{")) {
    cleanedString = `{${cleanedString}`;
  }

  // Step 16: Log the final cleaned string before parsing for debugging
  console.log("🚀 ~ Final cleaned string:", cleanedString);

  // Step 17: Parse the cleaned string into a JSON object
  try {
    const parsedObject = JSON.parse(cleanedString) as Cube;
    return parsedObject;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
};

const extractPartsWithSql = (parsedData: Cube | null): CubeResult[] => {
  const results: CubeResult[] = []; // Ensure the result array is correctly typed

  if (!parsedData) {
    console.error("Parsed data is null. Cannot extract parts.");
    return results; // Return an empty array if parsedData is null
  }

  // Extract measures
  if (parsedData.measures) {
    Object.entries(parsedData.measures).forEach(([name, measure]) => {
      const typedMeasure = measure as Measure; // Explicitly type 'measure'
      results.push({
        category: "measures",
        name,
        sql: typedMeasure.sql || "", // Optional property
        type: typedMeasure.type || "",
        title: typedMeasure.title || "", // Not present in your example but added for completeness
        description: typedMeasure.description || "",
        primaryKey: extractPrimaryKey(`primaryKey: ${typedMeasure.primaryKey}`), // Default to false if not provided
      });
    });
  }

  // Extract dimensions
  if (parsedData.dimensions) {
    Object.entries(parsedData.dimensions).forEach(([name, dimension]) => {
      const typedDimension = dimension as Dimension; // Explicitly type 'dimension'
      results.push({
        category: "dimensions",
        name,
        sql: typedDimension.sql || "", // Optional property
        type: typedDimension.type || "",
        title: typedDimension.title || "", // Not present in your example but added for completeness
        description: typedDimension.description || "",
        primaryKey: extractPrimaryKey(
          `primaryKey: ${typedDimension.primaryKey}`,
        ), // Default to false if not provided
      });
    });
  }

  if (parsedData.joins) {
    Object.entries(parsedData.joins).forEach(([name, join]) => {
      const typedJoin = join as Dimension; // Explicitly type 'dimension'
      results.push({
        category: "joins",
        name,
        sql: typedJoin.sql || "", // Optional property
        type: typedJoin.type || "",
        title: typedJoin.title || "", // Not present in your example but added for completeness
        description: typedJoin.description || "",
        primaryKey: extractPrimaryKey(`primaryKey: ${typedJoin.primaryKey}`), // Default to false if not provided
      });
    });
  }

  return results;
};

function extractSQL(matchString: string) {
  const sqlRegex = /sql:\s*`([^`]*)`/;
  const match = matchString.match(sqlRegex);
  return match ? match[1] : "";
}

function extractPrimaryKey(matchString: string): boolean {
  const primaryKeyRegex = /primaryKey:\s*(true|false)/;
  const match = matchString.match(primaryKeyRegex);
  return match ? match[1] === "true" : false;
}

const TBodyRowSkeleton = ({ style }: { style?: CSSProperties }) => {
  const icon = { name: "model" as IconName };
  return (
    <ModelTableRow skeleton style={style}>
      {/* Name */}
      <NameCell icon={icon}>
        <CellTextSkeleton />
      </NameCell>

      {/* Collection */}
      <ModelCell {...collectionProps}>
        <Flex>
          <CollectionsIcon name="folder" />
          <CellTextSkeleton />
        </Flex>
      </ModelCell>

      {/* Description */}
      <ModelCell {...descriptionProps}>
        <CellTextSkeleton />
      </ModelCell>

      {/* Adds a border-radius to the table */}
      <Columns.RightEdge.Cell />
    </ModelTableRow>
  );
};
