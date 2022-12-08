import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { updateCollapse } from '@/redux/modules/menu/action';
import LayoutMenu from './components/Menu';
import LayoutHeader from './components/Header';
import LayoutFooter from './components/Footer';
import { connect } from 'react-redux';
import './index.less';

const MainLayout = (props: any) => {
	const { Sider, Content } = Layout;

	return (
		<section className="container">
			<Sider trigger={null} collapsed={props.isCollapse} width={220} theme="dark">
				<LayoutMenu></LayoutMenu>
			</Sider>
			<Layout>
				<Content>
					<Outlet></Outlet>
				</Content>
			</Layout>
		</section>
	);
};

const mapStateToProps = (state: any) => {
	return state.menu;
};
const mapDispatchToProps = { updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(MainLayout);
