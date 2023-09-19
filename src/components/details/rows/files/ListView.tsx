import * as React from "react";
import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    IDetailsHeaderProps,
    IDetailsRowProps,
    IRenderFunction,
    SelectionMode,
} from "@fluentui/react";
import { useMemo } from "react";
import { ApplicationType, FileTypeIcon } from "./FileTypeIcon";

// Original version from:
// https://pnp.github.io/sp-dev-fx-controls-react/controls/FileTypeIcon/

type Props = {
    /**
     * Specify the name of the file URL path which will be used to show the file icon.
     */
    iconFieldName?: string;
    /**
     * The items to render.
     */
    items?: any[];
    /**
     * The fields you want to view in your list view
     */
    viewFields?: IViewField[];
    /**
     * Boolean value to indicate if the component should render in compact mode.
     * Set to false by default
     */
    compact?: boolean;

    /**
     * Callback to override the default row rendering.
     */
    onRenderRow?: (props: IDetailsRowProps) => JSX.Element | undefined;
    /**
     * Class name to apply additional styles on list view wrapper
     */
    className?: string;
    /**
     * Class name to apply additional styles on list view
     */
    listClassName?: string;
};

export interface IViewField {
    /**
     * Name of the field
     */
    name: string;
    /**
     * Name of the field that will be used as the column title
     */
    displayName?: string;
    /**
     * Specify the field name that needs to be used to render a link
     */
    linkPropertyName?: string;
    /**
     * Specify if you want to enable column sorting
     */
    sorting?: boolean;
    /**
     * Specify the minimum width of the column
     */
    minWidth?: number;
    /**
     * Specify the maximum width of the column
     */
    maxWidth?: number;
    /**
     * Determines if the column can be resized.
     */
    isResizable?: boolean;
    /**
     * Override the render method of the field
     */
    render?: (item?: any, index?: number, column?: IColumn) => any;
}

export const ListView = (props: Props) => {
    const { compact, className, listClassName, items, iconFieldName, viewFields } = props;

    const columns = useMemo(() => {
        /**
         * Create an icon column rendering
         * @param iconField
         */
        const createIconColumn = (iconFieldName: string): IColumn => {
            return {
                key: "fileType",
                name: "File Type",
                iconName: "Page",
                isIconOnly: true,
                fieldName: "fileType",
                minWidth: 16,
                maxWidth: 16,
                onRender: (item: any): any => {
                    if (item?.ContentTypeId?.indexOf("0x0120") === 0 || item?.FSObjType === "1") {
                        return <FileTypeIcon application={ApplicationType.Folder} />;
                    }
                    return <FileTypeIcon path={item[iconFieldName]} />;
                },
            };
        };
        const fieldRender = (field: IViewField): any | void => {
            // Check if a render function is specified
            if (field.render) {
                return field.render;
            }

            // Check if the URL property is specified
            if (field.linkPropertyName) {
                // eslint-disable-next-line react/display-name
                return (item: any, index?: number, column?: IColumn) => {
                    if (!field?.linkPropertyName || !column?.fieldName) {
                        return null;
                    }
                    return (
                        <a key={`${column.fieldName}-${index}`} href={item[field.linkPropertyName]}>
                            {item[column.fieldName]}
                        </a>
                    );
                };
            }
        };

        const createColumns = (viewFields: IViewField[]): IColumn[] => {
            return viewFields.map((field) => {
                return {
                    key: field.name,
                    name: field.displayName || field.name,
                    fieldName: field.name,
                    minWidth: field.minWidth || 50,
                    maxWidth: field.maxWidth,
                    isResizable: field.isResizable,
                    onRender: fieldRender(field),
                };
            });
        };

        let columns = new Array<IColumn>();

        // Check if an icon needs to be shown
        if (iconFieldName) {
            const iconColumn = createIconColumn(iconFieldName);
            columns.push(iconColumn);
        }

        // Check if view fields were provided
        if (viewFields) {
            columns = columns.concat(createColumns(viewFields));
        }
        return columns;
    }, [iconFieldName, viewFields]);

    /**
     * Custom render of header
     * @param props
     * @param defaultRender
     */
    const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
        if (!props) {
            return null;
        }
        props.className = "pt-0";

        return defaultRender?.(props) || null;
    };

    return (
        <div className={className}>
            {!!items && (
                <DetailsList
                    items={items}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    selectionPreservedOnEmptyClick={true}
                    layoutMode={DetailsListLayoutMode.justified}
                    compact={compact}
                    className={listClassName}
                    onRenderDetailsHeader={onRenderDetailsHeader}
                />
            )}
        </div>
    );
};
