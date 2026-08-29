import { createCrudService } from "./crud.factory";
import { endpoints } from "./api/endpoints";
import type { UserType } from "@/types/models";

export const userTypesService = createCrudService<UserType>(endpoints.userTypes.root);
