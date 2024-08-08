import * as React from "react";
import { DetailsView, DetailsViewContext } from "@/contexts/DetailsViewContext";
import { Entity } from "@business-governance/api";
import { ReactNode, useState } from "react";

type Props = {
    children: ReactNode;
};

// TODO: use routes instead of context?
export function DetailsViewProvider(props: Props) {
    const { children } = props;

    const [view, setView] = useState<DetailsView>({
        view: "details",
    });
    const [entity, setEntity] = useState<Entity | undefined>(undefined);

    return (
        <DetailsViewContext.Provider value={{ view, setView, entity, setEntity }}>
            {children}
        </DetailsViewContext.Provider>
    );
}
