import { Permission } from "./permission.model";

export interface PermissionGroup {
    resource: string;
    permissions: Permission[];
    icon: string;
}