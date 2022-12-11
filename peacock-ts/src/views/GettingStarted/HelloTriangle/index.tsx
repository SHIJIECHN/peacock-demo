import React, { Component } from 'react';
import Renderer from '../../../peacock/core/render/Renderer';

export default class HelloTriangle extends Component {
	private readonly canvasRef: React.RefObject<HTMLCanvasElement> | undefined;

	constructor(props: {}) {
		super(props);
		this.canvasRef = React.createRef();
	}

	componentDidMount(): void {
		const canvas = this.canvasRef.current;
		canvas.width = canvas.height = 640;
		const renderer = new Renderer(canvas);
		renderer.start();
	}

	render() {
		return <canvas ref={this.canvasRef}></canvas>;
	}
}
