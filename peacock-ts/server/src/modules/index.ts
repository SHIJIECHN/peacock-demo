module.exports = {
	'GET /getMenu': (req: Request, res: any) => {
		const response = require('./gupdate/menu.json');
		return res.json(response);
	}
};
