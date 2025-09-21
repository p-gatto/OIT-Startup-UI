import { Group } from "./group.model";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    fullName: string;
    isActive: boolean;
    emailConfirmed: boolean;
    lastLoginAt?: string;
    groups: Group[];
    permissions: string[];
    createdAt: string;
}