import { RoleItem, Entity } from "@business-governance/api";
import { createContext } from "react";

export type DetailsView = { view: "details" } | { view: "role", role: RoleItem };

type DetailsViewContext = {
    view: DetailsView;
    setView: (view: DetailsView) => void;
    entity: Entity | undefined;
    setEntity: (entity: Entity) => void;
};

export const DetailsViewContext = createContext<DetailsViewContext>({
    view: { view: "details" },
    setView: () => { },
    entity: undefined,
    setEntity: () => { },
});