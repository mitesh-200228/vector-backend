const Team = require('../models/Team');

function TeamController(){
    return{
        async Edit(req,res){
            const team = req.body;
            if(!team){
                return res.status(404).json({message:'Send All Details'});
            }
            try {
                await Team.findOneAndUpdate({email:team.email},{$set:{}});
            } catch (error) {
                return res.status(500).json({message:'Internal Server Error'});
            }
        }
    }
}

module.exports = TeamController;