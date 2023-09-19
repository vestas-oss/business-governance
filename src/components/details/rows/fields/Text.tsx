import * as React from "react";
import { Entity } from "@/types/Entity";
import { useId } from "@fluentui/react-hooks";

type Props =
    | {
          field: string;
          entity: Entity;
      }
    | { children: string };

/**
 * Component that handles new line to br conversion and links
 */
export const Text = (props: Props) => {
    const id = useId();

    let s = "";
    if ("field" in props) {
        const { field, entity } = props;
        const value = entity.item[field];
        if (!value) {
            return null;
        }

        s = value.toString();
    } else {
        s = props.children;
    }

    const urlRegExp =
        /https?:\/\/(www\.)?[-a-za-z0-9@:%._+~#=]{1,256}\.[a-za-z0-9()]{1,6}\b([-a-za-z0-9()@:%_+.~#?&//=]*)/;

    const renderLinks = (text: string) =>
        text?.split(" ").map((part) =>
            urlRegExp.test(part) ? (
                <a href={part} key={part}>
                    {part}{" "}
                </a>
            ) : (
                part + " "
            )
        );

    const elements = s?.split("\n").map((item, index) => {
        return (
            <span key={`${id}-${index}`}>
                {renderLinks(item)}
                <br />
            </span>
        );
    });
    return <>{elements}</>;
};
