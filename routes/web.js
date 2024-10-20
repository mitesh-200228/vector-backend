const MainContoller = require('../controller/MainController.js');

function rest(app) {
    app.get('/', (req, res) => { return res.status(200).json({ message: "Working" }) });
    app.post('/model',MainContoller().model);
    app.get('/matcher',MainContoller().matcher);
}

module.exports = rest;