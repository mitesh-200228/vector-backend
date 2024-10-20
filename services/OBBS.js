function OBBS(data){
    const datas = {
        email:data.email,
        teamname:data.teamname,
        homeUniversity:data.homeUniversity,
        activemembers:data.activeMembers,
        attendeventmembers:data.attendeventmembers,
        teamrepresentetive:data.teamrepresentetive,
        emailrepresentetive:data.emailrepresentetive,
        numberrepresentetive:data.numberrepresentetive,
        officialteamname:data.officialteamname,
        teamaddress:data.teamaddress,
        country:data.country,
        postalcode:data.postalcode,
    }
    return datas;
}

module.exports = OBBS;