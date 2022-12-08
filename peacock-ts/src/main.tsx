// import ReactDOM from 'react-dom/client';
import '@/styles/common.less';
import '@/styles/reset.less';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from '@/redux';
import { PersistGate } from 'redux-persist/integration/react';

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
// 	// <React.StrictMode>
// 	<Provider store={store}>
// 		<PersistGate persistor={persistor}>
// 			<App />
// 		</PersistGate>
// 	</Provider>
//
// 	// </React.StrictMode>
// );

import ReactDOM from 'react-dom';
// react 17 创建，控制台会报错，暂时不影响使用（菜单折叠时不会出现闪烁）
ReactDOM.render(
	// * react严格模式
	// <React.StrictMode>
	<Provider store={store}>
		<PersistGate persistor={persistor}>
			<App />
		</PersistGate>
	</Provider>,
	// </React.StrictMode>,
	document.getElementById('root')
);
