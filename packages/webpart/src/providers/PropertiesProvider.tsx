import * as React from "react";
import { PropertiesContext } from "@/contexts/PropertiesContext";
import { Properties } from "@/types/Properties";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { ReactNode, useCallback, useState } from "react";

type Props = {
    children: ReactNode;
    properties: Properties;

    setProperties?: (properties: Properties) => void;
};

/**
 * Handles properties from web part
 */
export function PropertiesProvider(props: Props) {
    const { children, setProperties: setPropertiesCallback } = props;

    const [properties, setProperties] = useState(props.properties);

    const mergeProperties = useCallback(
        (newProperties: Properties) => {
            setProperties((p) => {
                const n = Object.assign({}, p, newProperties);
                setPropertiesCallback?.(n);
                return n;
            });
        },
        [setProperties, setPropertiesCallback]
    );

    return (
        <PropertiesContext.Provider value={{ properties, setProperties: mergeProperties }}>
            {children}
        </PropertiesContext.Provider>
    );
}
