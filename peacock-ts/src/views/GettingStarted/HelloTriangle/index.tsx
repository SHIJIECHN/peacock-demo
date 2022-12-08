import React, { Component } from 'react';

export default class HelloTriangle extends Component {
	private readonly canvasRef: React.RefObject<HTMLCanvasElement> | undefined;

	constructor(props: {}) {
		super(props);
		this.canvasRef = React.createRef();
	}

	componentDidMount(): void {
		const canvas = this.canvasRef?.current;
		const gl = canvas?.getContext('webgl2');
		console.log(gl);
	}

	render() {
		return <canvas ref={this.canvasRef}></canvas>;
	}
}
