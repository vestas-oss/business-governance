import * as React from "react";
import { NormalPeoplePicker, Spinner } from "@fluentui/react";
import { IPersonaProps } from "@fluentui/react/lib/components/Persona/Persona.types";
import {
    IBasePickerStyles,
    IBasePickerSuggestionsProps,
} from "@fluentui/react/lib/components/pickers/BasePicker.types";
import { SPFI } from "@pnp/sp";
import { useEffect, useState } from "react";
import { PeopleSearchService } from "./PeopleSearchService";

function uniqBy<T>(arr: Array<T>, predicate: keyof T): Array<T> {
    const cb = (o: T) => o[predicate];

    const result = new Array<T>();
    const map = new Map();

    arr.forEach((item) => {
        const key = item === null || item === undefined ? item : cb(item);

        if (!map.has(key)) {
            map.set(key, item);
            result.push(item);
        }
    });

    return result;
}

type Props = {
    context: SPFI;

    disabled?: boolean;

    suggestionsLimit?: number;

    /**
     * Method to check value of People Picker text
     */
    onChange?: (items: IPersonaProps[]) => void;

    /**
     * Default Selected User emails or loginname
     */
    defaultSelectedUsers?: string[];

    /**
     * Placeholder to be displayed in an empty term picker
     */
    placeholder?: string;
    /**
     * styles to apply on control
     */
    styles?: Partial<IBasePickerStyles>;
};

export function PeoplePicker(props: Props) {
    const { defaultSelectedUsers } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [selectedPersons, setSelectedPersons] = useState<Array<IPersonaProps>>([]);
    const [mostRecentlyUsedPersons, setMostRecentlyUsedPersons] = useState<Array<any>>([]);

    const suggestionsLimit = props.suggestionsLimit ? props.suggestionsLimit : 5;

    useEffect(() => {
        (async () => {
            if (!defaultSelectedUsers) {
                return;
            }
            setIsLoading(true);

            // Check for default user values
            const selectedPersons: IPersonaProps[] = [];
            if (defaultSelectedUsers) {
                for (const userValue of defaultSelectedUsers) {
                    const peopleSearchService = new PeopleSearchService(props.context);

                    const userResult = await peopleSearchService.searchPersonByEmailOrLogin(
                        userValue
                    );

                    if (userResult) {
                        selectedPersons.push(userResult);
                    } else {
                        let text = userValue;
                        if (!text) {
                            text = "Not found";
                        }
                        selectedPersons.push({
                            id: text,
                            text,
                            title: "User not found",
                            styles: { primaryText: { color: "red" } },
                        });
                    }
                }
            }

            selectedPersons.sort((a, b) => (a.text || "").localeCompare(b.text || ""));
            setSelectedPersons(selectedPersons);
            setIsLoading(false);
        })();
    }, [defaultSelectedUsers, props.context]);

    /**
     * A search field change occured
     */
    const onResolveSuggestions = async (
        filter: string,
        selectedItems?: IPersonaProps[]
    ): Promise<IPersonaProps[]> => {
        if (filter.length > 2) {
            const peopleSearchService = new PeopleSearchService(props.context);

            const results = await peopleSearchService.searchPeople(filter, suggestionsLimit);
            // Remove duplicates
            const filteredPersons = removeDuplicates(results, selectedPersons || []);
            // Add the users to the most recently used ones
            let recentlyUsed = [...filteredPersons, ...(mostRecentlyUsedPersons || [])];
            recentlyUsed = uniqBy(recentlyUsed, "text");

            setMostRecentlyUsedPersons(recentlyUsed.slice(0, suggestionsLimit));
            return filteredPersons;
        } else {
            return [];
        }
    };

    const onChange = (items?: IPersonaProps[]): void => {
        setSelectedPersons(items || []);

        props.onChange?.(items || []);
    };

    /**
     * Returns the most recently used person
     *
     * @param currentPersonas
     */
    const onEmptyResolveSuggestions = (currentPersonas?: IPersonaProps[]): IPersonaProps[] => {
        return removeDuplicates(mostRecentlyUsedPersons || [], currentPersonas || []);
    };

    /**
     * Removes duplicates
     *
     * @param personas
     * @param possibleDupes
     */
    const removeDuplicates = (
        personas: IPersonaProps[],
        possibleDupes: IPersonaProps[]
    ): IPersonaProps[] => {
        const listContainsPersona = (
            persona: IPersonaProps,
            personas: IPersonaProps[]
        ): boolean => {
            if (!personas || !personas.length || personas.length === 0) {
                return false;
            }
            return personas.filter((item) => item.text === persona.text).length > 0;
        };

        return personas.filter((persona) => !listContainsPersona(persona, possibleDupes));
    };

    const { placeholder, styles, disabled } = props;

    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: "Suggested People",
        mostRecentlyUsedHeaderText: "Suggested Contacts",
        noResultsFoundText: "No results found",
        loadingText: "Loading",
        showRemoveButtons: true,
        suggestionsAvailableAlertText: "People Picker Suggestions available",
        suggestionsContainerAriaLabel: "Suggested contacts",
    };

    return (
        <>
            {isLoading ? (
                <Spinner label="Loading users..." ariaLive="assertive" labelPosition="right" />
            ) : (
                <NormalPeoplePicker
                    pickerSuggestionsProps={pickerSuggestionsProps}
                    styles={styles}
                    onResolveSuggestions={onResolveSuggestions}
                    onEmptyResolveSuggestions={onEmptyResolveSuggestions}
                    getTextFromItem={(peoplePersonaMenu: IPersonaProps) =>
                        peoplePersonaMenu.text || ""
                    }
                    removeButtonAriaLabel="Remove"
                    inputProps={{
                        "aria-label": "People Picker",
                        placeholder: placeholder,
                    }}
                    selectedItems={selectedPersons}
                    disabled={disabled}
                    onChange={onChange}
                    resolveDelay={200}
                />
            )}
        </>
    );
}
