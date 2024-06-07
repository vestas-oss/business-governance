import * as React from "react";
import { Bootstrap } from "@/components/lazy/Bootstrap";
import { useProperties } from "@/hooks/useProperties";
import { useSetProperties } from "@/hooks/useSetProperties";
import {
    Dropdown,
    IDropdownOption,
    Pivot,
    PivotItem,
    Separator,
    TextField,
    Toggle,
} from "@fluentui/react";
import { useEffect, useState } from "react";

export function EditMode() {
    const properties = useProperties();
    const setProperties = useSetProperties();
    const [list, setList] = useState(properties?.entityListTitle);
    const [startNode, setStartNode] = useState(properties?.startNode);
    const [filter, setFilter] = useState(properties?.filter);
    const [select, setSelect] = useState(properties?.select);
    const [group, setGroup] = useState(properties?.group);
    const [legend, setLegend] = useState(properties?.legend);
    const [search, setSearch] = useState(properties?.search);
    const [multilineTitles, setMultilineTitles] = useState(properties?.multilineTitles);
    const [parentColumnName, setParentColumnName] = useState(properties?.parentColName);
    const [groupTitleTextSize, setGroupTitleTextSize] = useState(properties?.groupTitleTextSize);

    useEffect(() => {
        setProperties?.({ entityListTitle: list });
    }, [list, setProperties]);

    useEffect(() => {
        setProperties?.({ startNode });
    }, [startNode, setProperties]);

    useEffect(() => {
        setProperties?.({ filter });
    }, [filter, setProperties]);

    useEffect(() => {
        setProperties?.({ select });
    }, [select, setProperties]);

    useEffect(() => {
        setProperties?.({ group });
    }, [group, setProperties]);

    useEffect(() => {
        setProperties?.({ legend });
    }, [legend, setProperties]);

    useEffect(() => {
        setProperties?.({ search });
    }, [search, setProperties]);

    useEffect(() => {
        setProperties?.({ multilineTitles });
    }, [multilineTitles, setProperties]);

    useEffect(() => {
        setProperties?.({ parentColName: parentColumnName });
    }, [parentColumnName, setProperties]);

    useEffect(() => {
        setProperties?.({ groupTitleTextSize });
    }, [groupTitleTextSize, setProperties]);

    return (
        <>
            <div className="w-full">
                <Pivot aria-label="Links of Tab Style Pivot Example" linkFormat="tabs">
                    <PivotItem headerText="Configuration">
                        <div className="w-80">
                            <TextField
                                label="List"
                                value={list}
                                onChange={(e, value) => {
                                    setList(value);
                                }}
                                description="Title of the list to show data from."
                            />
                            <TextField
                                label="Start Node"
                                value={startNode}
                                onChange={(e, value) => {
                                    setStartNode(value);
                                }}
                                description="ID of the initial item to focus."
                            />
                            <TextField
                                label="Parent Column"
                                value={parentColumnName}
                                onChange={(e, value) => {
                                    setParentColumnName(value);
                                }}
                                description="Internal name of the column that acts as the parent/child relationship."
                            />
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Display">
                        <div className="w-80">
                            <Toggle
                                label="Group nodes"
                                defaultChecked={group}
                                onText="On"
                                offText="Off"
                                onChange={(e, value) => {
                                    setGroup(value);
                                }}
                            />
                            <Toggle
                                label="Legend"
                                defaultChecked={legend}
                                onText="On"
                                offText="Off"
                                onChange={(e, value) => {
                                    setLegend(value);
                                }}
                            />
                            <Toggle
                                label="Search"
                                defaultChecked={search}
                                onText="On"
                                offText="Off"
                                onChange={(e, value) => {
                                    setSearch(value);
                                }}
                            />
                            <Toggle
                                label="Multiline titles"
                                defaultChecked={multilineTitles}
                                onText="On"
                                offText="Off"
                                onChange={(e, value) => {
                                    setMultilineTitles(value);
                                }}
                            />
                            <Dropdown
                                label="Group title text size"
                                selectedKey={groupTitleTextSize ?? "xs"}
                                onChange={(_, item: IDropdownOption<string>) => {
                                    setGroupTitleTextSize(item.key.toString());
                                }}
                                placeholder="Select an option"
                                options={[
                                    { key: "xs", text: "Extra Small" },
                                    { key: "sm", text: "Small" },
                                    { key: "base", text: "Normal" },
                                    { key: "lg", text: "Large" },
                                ]}
                            />
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Advanced">
                        <div className="flex flex-row justify-between">
                            <div className="w-80">
                                <TextField
                                    label="Filter"
                                    value={filter}
                                    onChange={(e, value) => {
                                        setFilter(value);
                                    }}
                                    description="OData filter (example: Title eq 'Example')"
                                />
                                <TextField
                                    label="Select"
                                    value={select}
                                    onChange={(e, value) => {
                                        setSelect(value);
                                    }}
                                    description="OData select (comma separated)"
                                />
                            </div>
                            <Bootstrap />
                        </div>
                    </PivotItem>
                </Pivot>
            </div>
            <Separator className="w-full" />
        </>
    );
}
