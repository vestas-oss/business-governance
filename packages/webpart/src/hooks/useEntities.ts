import { useQuery } from "react-query";
import { useConfiguration } from "./useConfiguration";
import { useBusinessGovernance } from "./useBusinessGovernance";

export const useEntities = () => {
    const configuration = useConfiguration();
    const bg = useBusinessGovernance();

    return useQuery(["entities", configuration?.entityListTitle, configuration?.filter, configuration?.select], async () => {
        return bg.entityService.getEntities();
    });
};