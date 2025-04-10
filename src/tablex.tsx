import React, { useState, useEffect } from "react";
import {
    useSuiClient,
} from "@mysten/dapp-kit";
import { Container, Heading, Text } from "@radix-ui/themes";
import {
    WARLOT_PACKAGEID_4,
    // Adjust the module name as needed.
    TABLE_MODULE,
    USE_PROJECT_4,
} from "./constants";
// import type { SuiObjectResponse } from "@mysten/sui"; // 

// Define a type for our column data.
interface ColumnData {
    objectId: string;
    name: string;
    values: string[];
}

// Define a type for each table’s data that we want to render.
interface TableData {
    table: any;
    columns: ColumnData[];
}

export function TableDisplay() {
    const suiClient = useSuiClient();
    const [tablesData, setTablesData] = useState<TableData[]>([]);
    const [loadingTables, setLoadingTables] = useState(true);
    const [tablesError, setTablesError] = useState<any>(null);

    // Fetch all table objects from the project and then fetch their column details.
    async function fetchTables() {
        setLoadingTables(true);
        setTablesError(null);
        try {
            // Get dynamic fields for the project
            // (Assumes the response has a shape like { data: [ ... ], nextCursor, hasNextPage })
            const dynamicFieldsResponse = await suiClient.getDynamicFields({
                parentId: USE_PROJECT_4,
            });
            // Filter for table objects (adjust the object type as needed)
            const tableFields = dynamicFieldsResponse?.data?.filter(
                (f) =>
                    f.objectType ===
                    `${WARLOT_PACKAGEID_4}::${TABLE_MODULE}::Table`
            );
            const tableIds = tableFields?.map((f) => f.objectId) || [];

            // Fetch full details for each table
            const tablesResponse = await suiClient.multiGetObjects({
                ids: tableIds,
                options: { showContent: true },
            });

            // For each table, fetch its dynamic fields representing the columns.
            const tablesWithColumns: TableData[] = await Promise.all(
                tablesResponse.map(async (table: any) => {
                    const tableId = table.data.objectId;
                    // Fetch dynamic fields for the table to get the columns.
                    const dynamicColumnsResponse = await suiClient.getDynamicFields({
                        parentId: tableId,
                    });
                    // Filter to get only the column fields.
                    // In our sample, the type of these fields is "DynamicField".
                    const columnFields = dynamicColumnsResponse?.data?.filter(
                        (f) => f.type === "DynamicField"
                    );
                    const columnIds = columnFields?.map((f) => f.objectId) || [];
                    // Get full details for each column.
                    const columnsResponse = await suiClient.multiGetObjects({
                        ids: columnIds,
                        options: { showContent: true },
                    });
                    // Map the response into our ColumnData type.
                    const columns: ColumnData[] = columnsResponse.map((col: any) => ({
                        objectId: col.data.objectId,
                        name: col.data.content.fields.name,
                        values: col.data.content.fields.value,
                    }));
                    return { table, columns };
                })
            );
            setTablesData(tablesWithColumns);
        } catch (error) {
            setTablesError(error);
        } finally {
            setLoadingTables(false);
        }
    }

    useEffect(() => {
        fetchTables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suiClient]);

    return (
        <Container style={{ padding: "1rem" }}>
            <Heading size="4" mb="3">
                Tables in Project
            </Heading>

            {loadingTables && <Text>Loading tables...</Text>}
            {tablesError && <Text color="red">Error: {tablesError.message}</Text>}

            {tablesData && tablesData.length > 0 ? (
                tablesData.map(({ table, columns }) => {
                    // Determine the number of rows from the first column (if any).
                    const numRows = columns[0]?.values?.length || 0;
                    return (
                        <Container
                            key={table.data.objectId}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderRadius: "8px",
                            }}
                        >
                            <Heading size="3" mb="2">
                                {table.data.content.fields.name}
                            </Heading>
                            <Text>
                                <strong>Time Created:</strong>{" "}
                                {table.data.content.fields.time_created}
                            </Text>
                            <Text>
                                <strong>Last Updated:</strong>{" "}
                                {table.data.content.fields.last_updated}
                            </Text>
                            <br />
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        {columns.map((col) => (
                                            <th
                                                key={col.objectId}
                                                style={{
                                                    border: "1px solid #ddd",
                                                    padding: "8px",
                                                    textAlign: "left",
                                                }}
                                            >
                                                {col.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: numRows }).map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {columns.map((col) => (
                                                <td
                                                    key={col.objectId}
                                                    style={{
                                                        border: "1px solid #ddd",
                                                        padding: "8px",
                                                    }}
                                                >
                                                    {col.values[rowIndex]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Container>
                    );
                })
            ) : (
                !loadingTables && <Text>No tables found.</Text>
            )}
        </Container>
    );
}
