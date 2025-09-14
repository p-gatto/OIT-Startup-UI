export interface MenuItem {
    title: string;
    icon: string;
    route?: string;
    queryParams?: any;
    children?: MenuItem[];
}