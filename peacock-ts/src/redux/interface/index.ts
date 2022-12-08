import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface ThemeConfigProp {
	primary: string;
	isDark: boolean;
	breadcrumb: boolean;
	footer: boolean;
}

/* GlobalState */
export interface GlobalState {
	token: string;
	userInfo: any;
	assemblySize: SizeType;
	themeConfig: ThemeConfigProp;
}

/* MenuState */
export interface MenuState {
	isCollapse: boolean;
	menuList: Menu.MenuOptions[];
}

/* BreadcrumbState */
export interface BreadcrumbState {
	breadcrumbList: {
		[propName: string]: any;
	};
}
