import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Router from '@/routers/index';
import useTheme from '@/hooks/useTheme';
import { connect } from 'react-redux';

const App = (props: any) => {
	const { assemblySize, themeConfig } = props;
	// 全局使用主题
	useTheme(themeConfig);

	return (
		<BrowserRouter>
			<ConfigProvider componentSize={assemblySize}>
				<Router />
			</ConfigProvider>
		</BrowserRouter>
	);
};

const mapStateToProps = (state: any) => state.global;
export default connect(mapStateToProps)(App);
