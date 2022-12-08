import { Layout } from 'antd';
import './index.less';

const LayoutHeader = () => {
	const { Header } = Layout;

	return (
		<Header>
			<div className="header-lf">Header</div>
		</Header>
	);
};

export default LayoutHeader;
