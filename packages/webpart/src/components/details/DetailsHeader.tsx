import * as React from "react";
import { CloseButton } from "@/components/buttons/CloseButton";
import { Entity } from "@/types/Entity";
import { ReactNode } from "react";
import { LastModified } from "./LastModified";

type Props = {
    entity: Entity;
    buttons?: ReactNode;
    onClose?: () => void;
};

export function DetailsHeader(props: Props) {
    const { buttons, entity, onClose } = props;

    return (
        <div className="m-[8px]">
            <div className="flex justify-between">
                <div className="flex items-end flex-[1.5]">
                    <div className="flex flex-row gap-1">{buttons}</div>
                </div>
                <div className="flex flex-row justify-between flex-[1] gap-1">
                    <LastModified entity={entity} />
                    <CloseButton onClick={onClose} className="" />
                </div>
            </div>
        </div>
    );
}
