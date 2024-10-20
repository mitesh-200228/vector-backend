const Message = require('../models/Message');

function ContactController() {
    return {
        async ContactUs(req, res) {
            const { name, email, message } = req.body;
            if (!name || !email || !message) {
                return res.status(404).json({ message: 'Please fill all the details!' });
            }

            try {
                await Message.create({ name, email, message }).then((result) => {
                    return res.status(200).send({ message: 'Message sent!' })
                }).catch(err => {
                    console.log('couldnt send message', err)
                    return res.status(500).send({ message: "Internal Server Error" })
                })
            } catch (error) {
                console.log(error);
                return res.status(500).send({ message: "Internal Server Error" })
            }
        }
    }
}

module.exports = ContactController;