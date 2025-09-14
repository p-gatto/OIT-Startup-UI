export interface MenuItemDto {
    id: number;
    title: string;
    icon?: string;
    route?: string;
    queryParams?: { [key: string]: any };
    order: number;
    isActive: boolean;
    parentId?: number;
    children?: MenuItemDto[];
    expanded?: boolean;
}

export interface MenuGroupDto {
    id: number;
    title: string;
    order: number;
    isActive: boolean;
    items: MenuItemDto[];
    expanded?: boolean;
}

export interface CreateMenuItemDto {
    title: string;
    icon?: string;
    route?: string;
    queryParams?: { [key: string]: any };
    order: number;
    isActive: boolean;
    parentId?: number;
    menuGroupId: number;
}

export interface UpdateMenuItemDto {
    title?: string;
    icon?: string;
    route?: string;
    queryParams?: { [key: string]: any };
    order?: number;
    isActive?: boolean;
    parentId?: number;
}

export interface CreateMenuGroupDto {
    title: string;
    order: number;
    isActive: boolean;
}