import { Permission } from "./permission.model";

export interface Group {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    isSystemGroup: boolean;
    userCount?: number;
    permissions?: Permission[];
    createdAt: string;
}