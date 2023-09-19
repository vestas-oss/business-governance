import * as React from "react";
import { createElement } from "react";
import { useQuery } from "react-query";

export function EditMode() {
    const { data: component, isFetched } = useQuery({
        queryKey: ["chunk", "edit-mode"],
        queryFn: async () => {
            return await import(
                /* webpackChunkName: 'business-governance-edit-mode' */
                "../EditMode"
            );
        },
    });
    if (!isFetched || !component) {
        return <></>;
    }

    return createElement(component.EditMode);
}
