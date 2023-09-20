import { createContext } from "react";

export type EntityDetailsLayout = {
    header: Array<EntityDetailsHeader>;
    sections: Array<EntityDetailsSection>;
}

export type EntityDetailsSection = {
    title: string;
    rows: Array<EntityDetailsRow>;
}

export type EntityDetailsHeader = {
    title: string;
}

export type EntityDetailsRow = {
    title: string;
    description?: string;
    type: EntityDetailsRowType;
    // TODO: rename?
    value: string;
}

export type EntityDetailsRowType = "MembersProvider" | "MeetingInfo" | "Files" | "DetailsProvider";

export type EntityLayout = {
    icon: string;
    color: string;
    contentType?: string;
    condition?: string;

    id: number;
    plural?: string;
    title: string;
    order?: number;
    description?: string;

    layout?: EntityDetailsLayout;
}

type EntityLayoutsContext = {
    layouts: Array<EntityLayout>;
    getLayout: (entity: any) => EntityLayout | undefined;
};

export const EntityLayoutsContext = createContext<EntityLayoutsContext>({ layouts: [], getLayout: () => { return undefined; } });