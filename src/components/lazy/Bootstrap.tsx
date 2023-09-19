import * as React from "react";
import { createElement } from "react";
import { useQuery } from "react-query";

export function Bootstrap() {
    const { data: component, isFetched } = useQuery({
        queryKey: ["chunk", "bootstrap"],
        queryFn: async () => {
            return await import(
                /* webpackChunkName: 'business-governance-bootstrap' */
                "../Bootstrap"
            );
        },
    });
    if (!isFetched || !component) {
        return <></>;
    }

    return createElement(component.Bootstrap);
}
