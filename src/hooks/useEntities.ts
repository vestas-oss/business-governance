import { Services } from "@/services/Services";
import { useQuery } from "react-query";
import { useConfiguration } from "./useConfiguration";
import { useSP } from "./useSP";

export const useEntities = () => {
    const { sp } = useSP();
    const configuration = useConfiguration();

    return useQuery(["entities", configuration?.entityListTitle, configuration?.filter, configuration?.select], async () => {
        return Services.entityService.getEntities(sp, configuration);
    });
};