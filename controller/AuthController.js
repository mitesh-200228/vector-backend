const Team = require('../models/Team');
const bcrypt = require('bcrypt');
const OBBS = require('../services/OBBS');
const generateToken = require('../services/generateToken');
const jwt = require('jsonwebtoken');

function AuthController() {
    return {
        async Me(req, res) {
            const { token } = req.body;
            // console.log(token)
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY || "@njkddm#jkim");
                const teamId = decoded.id;
                const team = await Team.findById(teamId);

                if (!team) {
                    return res.status(500).json({
                        team: null,
                    });
                } else {
                    return res.status(200).json({ team });
                }
            } catch (err) {
                return res.status(500).json({
                    team: null,
                    message: "Token invalid!"
                });
            }
        },
        async Login(req, res) {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Please fill all the details!' });
            }
            try {
                const team_exist = await Team.findOne({ email: email });
                if (!team_exist) {
                    return res.status(400).json({ message: 'Team Not Found, Please Register.' });
                } else if (team_exist.email === email) {
                    const is_password_correct = await bcrypt.compare(password, team_exist.password).then((data) => {
                        return data;
                    }).catch(err => {
                        console.log(err)
                        return res.status(403).json({ message: 'Internal Server Error' });
                    });
                    if (is_password_correct) {
                        const token = generateToken(team_exist.id);
                        return res.status(200).json({ message: "Login success!", teamData: OBBS(team_exist), token: token });
                    } else if (!is_password_correct) {
                        return res.status(403).json({ message: 'Invalid password' });
                    }

                    return res.status(500).json({ message: 'Internal Server Error' });
                }
            } catch (error) {
                console.log('team finding?', error)
                return res.status(500).json({ message: 'Internal Server Error' })
            }
        },
        async Register(req, res) {
            const { email, password, teamname, homeUniversity, activemembers, attendeventmembers, teamrepresentetive, emailrepresentetive, numberrepresentetive, teamlogo, officialteamname, teamaddress, country, postalcode } = req.body;

            if (!email || !password || !teamname || !homeUniversity || !activemembers || !attendeventmembers || !teamrepresentetive || !emailrepresentetive || !numberrepresentetive || !teamlogo || !officialteamname || !teamaddress || !country || !postalcode) {
                return res.status(400).json({ message: 'Please fill all the details!' });
            }
            try {
                const team_exist = await Team.findOne({ email: email });
                if (team_exist) {
                    return res.status(400).json({ message: 'Team Already Exists' });
                } else {
                    try {
                        const hashed_password = await bcrypt.hash(password, 10).then((data) => {
                            return data;
                        }).catch(err => {
                            throw new Error(err);
                        });
                        await Team.create({ email, password: hashed_password, teamname, homeUniversity, activemembers, attendeventmembers, teamrepresentetive, emailrepresentetive, numberrepresentetive, teamlogo, officialteamname, teamaddress, country, postalcode }).then((result) => {
                            const token = generateToken(result.id);
                            return res.status(200).json({ message: 'Created!', token: token });
                        }).catch(error => {
                            console.log('Couldnt create team', error)
                            return res.status(500).json({ message: 'Internal Server Error' })
                        });
                    } catch (error) {
                        return res.status(500).json({ message: 'Internal Server Error' })
                    }
                }
            } catch (error) {
                return res.status(500).json({ message: 'Internal Server Error' })
            }
        }
    }
}

module.exports = AuthController;