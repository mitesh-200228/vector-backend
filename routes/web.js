const MainContoller = require('../controller/MainController.js');

function rest(app) {
    app.get('/', (req, res) => { return res.status(200).json({ message: "Working" }) });
    app.post('/model',MainContoller().model);
    app.post('/matcher',MainContoller().matcher);
    app.post('/rooms',MainContoller().rooms);
    app.get('/allrooms',MainContoller().fetchAllRoom);
}

module.exports = rest;