import * as React from "react";
import { EntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { Entity } from "@/types/Entity";
import { IFieldInfo } from "@pnp/sp/fields";
import { AddMultilineTextProps } from "@pnp/sp/fields/types";
import { useMemo } from "react";
import { DetailsRow } from "../DetailsRow";
import { Date } from "./fields/Date";
import { Lookup } from "./fields/Lookup";
import { TermLabel } from "./fields/TermLabel";
import { Text } from "./fields/Text";
import { Users } from "./fields/Users";

type Props = {
    entity: Entity;
    row: EntityDetailsRow;
    fields: Array<IFieldInfo>;
};

export const FieldRow = (props: Props) => {
    const { row, entity, fields } = props;
    const fieldName = row.value;

    const field = useMemo(() => {
        return fields.find((f) => f.InternalName === fieldName);
    }, [fieldName, fields]);

    if (!field) {
        return null;
    }

    const value = entity.item[fieldName];

    const getElement = () => {
        switch (field.TypeAsString) {
            case "DateTime":
                if (!value) {
                    return null;
                }
                return <Date entity={entity} field={fieldName} />;
            case "UserMulti":
            case "User": {
                const userId = entity.item[fieldName + "Id"];
                if (!userId) {
                    return null;
                }
                return <Users entity={entity} field={fieldName} />;
            }
            case "Lookup": {
                const lookupField = field as IFieldInfo & {
                    LookupList: string;
                    LookupField: string;
                };
                const itemId = entity.item[fieldName + "Id"];
                if (!itemId) {
                    return null;
                }
                return (
                    <Lookup
                        id={itemId}
                        lookupList={lookupField.LookupList}
                        lookupField={lookupField.LookupField}
                    />
                );
            }
            case "TaxonomyFieldType":
                if (!value) {
                    return null;
                }

                if (value && value.Label === value.WssId.toString()) {
                    return <TermLabel entity={entity} wssId={value.WssId} />;
                }

                return <>{value}</>;
            case "Note": {
                if (!value) {
                    return null;
                }
                const noteField = field as IFieldInfo & AddMultilineTextProps;
                if (noteField.RichText) {
                    return <div dangerouslySetInnerHTML={{ __html: value }} />;
                }

                return <Text entity={entity} field={fieldName} />;
            }
            case "Choice":
            case "Number":
            case "Computed":
            case "Text":
                if (!value) {
                    return null;
                }
                return <Text entity={entity} field={fieldName} />;
            case "URL":
                if (!value) {
                    return null;
                }
                if (value?.Url) {
                    let description = value.Description;
                    if (!description) {
                        description = value.Url;
                    }
                    return <a href={value.Url}>{description}</a>;
                }
                return <>{value}</>;
            default:
                console.log(
                    `business-governance: Warning SharePoint type '${field.TypeAsString}' for field '${field.InternalName}' not supported in details provider.`
                );
        }

        if (!value) {
            return null;
        }

        return (
            <div className="w-full text-xs">
                <Text>{value.toString()}</Text>
            </div>
        );
    };

    const element = getElement();
    if (!element) {
        return null;
    }

    return <DetailsRow {...row}>{element}</DetailsRow>;
};
