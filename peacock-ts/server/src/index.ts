const express = require('express');
const path = require('path');
const apiMocker = require('mocker-api');

const app = express();
apiMocker(app, path.resolve('src/modules/ShaderProgram.ts'));
const server = app.listen(5000, () => {
	const port = server.address().port;
	console.log(`服务器启动成功, 访问地址为 http://127.0.0.1:${port}`);
});
