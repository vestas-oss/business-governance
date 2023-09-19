import { DetailsViewContext } from "@/contexts/DetailsViewContext";
import { useContext } from "react";

export const useDetailsView = () => {
    return useContext(DetailsViewContext);
};