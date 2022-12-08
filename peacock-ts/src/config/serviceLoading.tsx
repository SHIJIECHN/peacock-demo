import ReactDOM from 'react-dom/client';
import Loading from '@/components/Loading';

let needLoadingRequestCount = 0;

// * 显示loading
export const showFullScreenLoading = () => {
	if (needLoadingRequestCount === 0) {
		let oDiv = document.createElement('div');
		oDiv.setAttribute('id', 'loading');
		document.body.appendChild(oDiv);
		ReactDOM.createRoot(oDiv).render(<Loading />);
	}
};

// * 隐藏loading
export const tryHideFullScreenLoading = () => {
	if (needLoadingRequestCount <= 0) return;
	needLoadingRequestCount--;
	if (needLoadingRequestCount === 0) {
		document.body.removeChild(document.getElementById('loading') as HTMLElement);
	}
};
