import './index.less';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuProps, Spin } from 'antd';
import Logo from './components/Logo';
import * as Icons from '@ant-design/icons';
import { setMenuList } from '@/redux/modules/menu/action';
import { connect } from 'react-redux';
import { getOpenKeys, searchRoute } from '@/utils/util';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';

const LayoutMenu: React.FC = (props: any) => {
	const { pathname } = useLocation();
	const { isCollapse, setMenuList: setMenuListAction } = props;
	const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
	const [openKeys, setOpenKeys] = useState<string[]>([]);

	// 刷新页面菜单保持高亮
	useEffect(() => {
		setSelectedKeys([pathname]);
		const pathArr: string[] = getOpenKeys(pathname);
		isCollapse ? '' : setOpenKeys(pathArr);
	}, [pathname, isCollapse]);

	// 设置当前展开的 subMenu
	const onOpenChange = (openKeys: string[]) => {
		if (openKeys.length === 0 || openKeys.length === 1) return setOpenKeys(openKeys);
		const latestOpenKey = openKeys[openKeys.length - 1];
		if (latestOpenKey.includes(openKeys[0])) return setOpenKeys(openKeys);
		setOpenKeys([latestOpenKey]);
	};

	const [loading] = useState(false);
	// 定义 menu 类型
	type MenuItem = Required<MenuProps>['items'][number];
	function getItem(
		label: React.ReactNode,
		key: React.Key | null,
		icon?: React.ReactNode,
		children?: MenuItem[],
		type?: 'group'
	): MenuItem {
		return {
			key,
			icon,
			children,
			label,
			type
		} as MenuItem;
	}
	// 动态渲染 Icon 图标
	const customIcons: { [key: string]: any } = Icons;
	const addIcon = (name: string) => {
		return React.createElement(customIcons[name]);
	};

	// 处理后台返回菜单 key 值为 antd 菜单需要的 key 值
	const deepLoopFloat = (menuList: Menu.MenuOptions[], newArr: MenuItem[] = []) => {
		menuList.forEach((item: Menu.MenuOptions) => {
			if (!item?.children?.length) return newArr.push(getItem(item.title, item.path, addIcon(item.icon!)));
			newArr.push(getItem(item.title, item.path, addIcon(item.icon!), deepLoopFloat(item.children)));
		});
		return newArr;
	};

	const [menuList, setMenuList] = useState<MenuItem[]>([]);
	const data = [
		{
			icon: 'HomeOutlined',
			title: '基础',
			path: '/getting_started',
			children: [
				{
					icon: 'AppstoreOutlined',
					path: '/getting_started/hello_triangle',
					title: '三角形'
				}
			]
		}
		// {
		// 	icon: 'HomeOutlined',
		// 	title: '首页',
		// 	path: '/home/index'
		// }
		// {
		// 	icon: 'TableOutlined',
		// 	title: '超级表格',
		// 	path: '/proTable',
		// 	children: [
		// 		{
		// 			icon: 'AppstoreOutlined',
		// 			path: '/proTable/useHooks',
		// 			title: '使用 Hooks'
		// 		},
		// 		{
		// 			icon: 'AppstoreOutlined',
		// 			path: '/proTable/useComponent',
		// 			title: '使用 Component'
		// 		}
		// 	]
		// }
	];

	const getMenuData = async () => {
		try {
			if (!data) return;
			setMenuList(deepLoopFloat(data));
			setMenuListAction(data);
		} catch {
			console.log('data 为空');
		}
	};

	useEffect(() => {
		getMenuData();
	}, []);

	const navigate = useNavigate();
	const clickMenu = ({ key }: { key: string }) => {
		// 菜单选中
		setSelectedKeys([key]);
		const route = searchRoute(key, props.menuList);
		if (route.isLink) window.open(route.isLink, '_blank');
		navigate(key);
	};

	return (
		<div className="menu">
			<Spin spinning={loading} tip="Loading...">
				{/*<Logo></Logo>*/}
				<Menu
					theme="dark"
					mode="inline"
					triggerSubMenuAction="click"
					openKeys={openKeys}
					selectedKeys={selectedKeys}
					items={menuList}
					onClick={clickMenu}
					onOpenChange={onOpenChange}
				/>
			</Spin>
		</div>
	);
};

const mapStateToProps = (state: any) => state.menu;
const mapDispatchToProps = { setMenuList };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutMenu);
