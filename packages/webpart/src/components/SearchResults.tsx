import * as React from "react";
import { Link } from "@fluentui/react";
import { Result, Results } from "@orama/orama";

type Props = {
    results: Results<Result[]>;
};

export function SearchResults(props: Props) {
    const { results } = props;
    return (
        <div>
            <ul>
                {results.hits.length === 0 ? "No results." : null}
                {results.hits.map((r, index) => {
                    const id = r.document.id;
                    let href = `#/selected/${id}`;
                    if (r.document.parent) {
                        href = `#/focus/${r.document.parent}/selected/${id}`;
                    }
                    return (
                        <li key={`result-${index}`}>
                            <Link href={href}>{r.document.title as string}</Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
