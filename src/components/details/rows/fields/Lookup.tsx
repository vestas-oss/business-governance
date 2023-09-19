import * as React from "react";
import { useSP } from "@/hooks/useSP";
import { useEffect, useState } from "react";

type Props = {
    id: number;
    lookupList: string;
    lookupField: string;
};

export const Lookup = (props: Props) => {
    const { id, lookupList, lookupField } = props;
    const [item, setItem] = useState<any>();
    const { sp } = useSP();

    useEffect(() => {
        (async () => {
            if (!id) {
                return;
            }
            const item = await sp.web.lists.getById(lookupList).items.getById(id)();
            setItem(item);
        })();
    }, [id, lookupList, sp]);

    if (!item) {
        return <></>;
    }

    return <>{item[lookupField]}</>;
};
