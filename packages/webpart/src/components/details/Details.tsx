import * as React from "react";
import { EntityLayout } from "@/contexts/EntityLayoutsContext";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useDetailsView } from "@/hooks/useDetailsView";
import { useEntityLayouts } from "@/hooks/useEntityLayouts";
import { Entity } from "@/types/Entity";
import { Icon, Modal } from "@fluentui/react";
import "@pnp/sp/regional-settings/web";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ReactNode, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsSection } from "./DetailsSection";
import { EditRole } from "./EditRole";
import { EventRow } from "./rows/EventRow";
import { FieldRow } from "./rows/FieldRow";
import { FilesRow } from "./rows/FilesRow";
import { UsersRow } from "./rows/UsersRow";
import { Text } from "./rows/fields/Text";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";
dayjs.extend(utc);

export type Props = {
    open: boolean;
    onDismiss?: () => void;
    headerButtons?: ReactNode;
    entity: Entity;
};

export function Details(props: Props) {
    const { entity } = props;
    const { getLayout: getEntityLayout } = useEntityLayouts();
    const { view, setEntity } = useDetailsView();

    const configuration = useConfiguration();
    const bg = useBusinessGovernance();

    useEffect(() => {
        setEntity(entity);
    }, [entity, setEntity]);

    const { data: fields, isFetched: isFieldsFetched } = useQuery({
        queryKey: ["fields", configuration?.entityListTitle],
        queryFn: async () => {
            return await bg.entityService.getEntityFields();
        },
    });

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            return bg.entityUserService.getRoles();
        },
        enabled: configuration !== undefined,
    });

    const entityLayout = useMemo(() => {
        const populateLayout = (layout: EntityLayout): EntityLayout => {
            layout.layout?.sections.forEach((section) => {
                section.rows.forEach((row) => {
                    const value = row.value;

                    if (!row.description) {
                        if (row.type === "DetailsProvider") {
                            const field = fields?.find((f) => f.InternalName === value);
                            row.description = field?.Description;
                        }
                        if (row.type === "MembersProvider") {
                            const role = roles?.find((r) =>
                                "RoleId" in r ? r.RoleId === value : r.KeyId === value
                            );
                            row.description = role?.Description;
                        }
                    }
                });
            });

            return layout;
        };

        const layout = getEntityLayout(entity.item);

        if (!layout) {
            return undefined;
        }
        return populateLayout(layout);
    }, [getEntityLayout, entity, fields, roles]);

    const { data: defaultLayout } = useQuery({
        queryKey: ["defaultLayout"],
        queryFn: async () => {
            // Build layout from fields
            const layout: EntityLayout = {
                id: -1,
                icon: "TaskGroup",
                title: "Item",
                plural: "Items",
                color: "#1F4477",
                layout: {
                    header: [
                        {
                            title: "Title",
                        },
                    ],
                    sections: [
                        {
                            title: "Details",
                            rows:
                                fields?.map((f) => {
                                    return {
                                        title: f.Title,
                                        description: f.Description,
                                        type: "DetailsProvider",
                                        value: f.InternalName,
                                    };
                                }) || [],
                        },
                    ],
                },
            };

            return layout;
        },
        enabled: !entityLayout?.layout && isFieldsFetched,
    });

    const icon = entityLayout?.icon || defaultLayout?.icon;
    let layout = entityLayout?.layout;
    if (!layout) {
        console.log(
            `business-governance: Warning - failed to find entity layout for entity '${entity.id}', using default`
        );
        layout = defaultLayout?.layout;
    }

    if (props.open) {
        let title = <span className="ml-[10px] mb-1">{entity.title}</span>;
        const url = entity.item.Url;
        if (url) {
            title = (
                <span className="ml-[10px] mb-1">
                    <a href={url} style={{ color: "#00b5e4" }} className="underline">
                        {entity.title}
                    </a>
                </span>
            );
        }

        return (
            <Modal
                titleAriaId="Title"
                isOpen={true}
                isBlocking={true}
                containerClassName="flex flex-col flex-nowrap items-stretch w-[820px]">
                <DetailsHeader
                    entity={entity}
                    buttons={props.headerButtons}
                    onClose={props?.onDismiss}
                />

                {/* Divider */}
                <div className="border-t-4 border-solid border-b-0 border-x-0 border-t-[#00b5e4]" />

                {view.view === "details" ? (
                    <>
                        {/* Icon and title (optional link) */}
                        <div className="text-[#00b5e4] text-sm flex-auto flex items-center font-semibold pt-6 px-6">
                            <span className="text-xl">
                                <Icon iconName={icon} />
                            </span>
                            {title}
                        </div>
                        {/* Details */}
                        <div className="flex-auto overflow-y-hidden pr-[24px] pb-[24px] pl-[24px]">
                            {layout?.header?.map((h, index) => {
                                return (
                                    <div key={`header-${index}`} className="italic ml-[2em]">
                                        <Text>{entity.item[h.title]?.toString()}</Text>
                                    </div>
                                );
                            })}
                            {layout?.sections?.map((section, index) => {
                                const hasElements = section.rows.length > 0;
                                const rows = section.rows.map((row, index) => {
                                    switch (row.type) {
                                        case "MembersProvider":
                                            return (
                                                <UsersRow
                                                    key={`${row.title}-${index}`}
                                                    entity={entity}
                                                    row={row}
                                                />
                                            );
                                        case "MeetingInfo":
                                            return (
                                                <EventRow
                                                    key={`${row.title}-${index}`}
                                                    entity={entity}
                                                    row={row}
                                                />
                                            );
                                        case "Files":
                                            return (
                                                <FilesRow
                                                    key={`${row.title}-${index}`}
                                                    entity={entity}
                                                    row={row}
                                                />
                                            );
                                        case "DetailsProvider":
                                        default:
                                            if (row.type !== "DetailsProvider") {
                                                console.log(
                                                    `business-governance: Warning value provider '${row.type}' for '${row.title}' not recognized, fallback to details provider.`
                                                );
                                            }

                                            return (
                                                <FieldRow
                                                    key={`${row.title}-${index}`}
                                                    row={row}
                                                    fields={fields || []}
                                                    entity={entity}
                                                />
                                            );
                                    }
                                });
                                if (hasElements) {
                                    return (
                                        <DetailsSection
                                            key={`section-${index}`}
                                            title={section.title}>
                                            {rows}
                                        </DetailsSection>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </>
                ) : (
                    <EditRole />
                )}
            </Modal>
        );
    }
}
