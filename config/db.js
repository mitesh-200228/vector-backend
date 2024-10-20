const mongoose = require('mongoose');

const connection = async (req, res) => {
    try {
        await mongoose.connect(process.env.DB_URL).then(() => {
            console.log("Connected Successfully");
        }).catch(err => {
            console.log(err);
        })
    } catch (error) {
        return res.status(400).json({message:'Something Wrong, Please try again'});
    }
}

module.exports = connection;