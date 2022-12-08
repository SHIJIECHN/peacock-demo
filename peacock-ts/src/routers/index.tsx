import { RouteObject } from '@/routers/interface';
import { Navigate, useRoutes } from 'react-router-dom';

// * 导入所有router
const metaRouters = import.meta.globEager('./modules/*.tsx');

export const routerArray: RouteObject[] = [];
Object.keys(metaRouters).forEach((item: string) => {
	Object.keys(metaRouters[item] as Object).forEach((key: any) => {
		// @ts-ignore
		routerArray.push(...metaRouters[item][key]);
	});
});

export const rootRouter: RouteObject[] = [
	{
		path: '/',
		element: <Navigate to="/getting_started/hello_triangle" />
	},
	...routerArray
];

const Router = () => {
	// @ts-ignore
	const routes = useRoutes(rootRouter);
	return routes;
};

export default Router;
