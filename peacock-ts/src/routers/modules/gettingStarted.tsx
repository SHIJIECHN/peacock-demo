import { RouteObject } from '@/routers/interface';
import { LayoutIndex } from '@/routers/constant';
import lazyLoad from '@/routers/utils/lazyLoad';
import React from 'react';

const gettingStartedRouter: Array<RouteObject> = [
	{
		element: <LayoutIndex />,
		meta: {
			title: '基础'
		},
		children: [
			{
				path: '/getting_started/hello_triangle',
				element: lazyLoad(React.lazy(() => import('@/views/GettingStarted/HelloTriangle'))),
				meta: {
					requiresAuth: false,
					title: 'hello triangle',
					key: 'helloTriangle'
				}
			}
		]
	}
];

export default gettingStartedRouter;
