const Users = require("../models/Users");
const axios = require("axios");
const userdata = require("../data.json");
const keyword_extractor = require("keyword-extractor");
// const { pipeline } = require('@xenova/transformers');
// import { SentenceTransformer } from "@tuesdaycrowd/sentence-transformers";

function MainContoller() {
  return {
    async model(req, res) {
      const { linkedinurl, room_id } = req.body;
      if (!linkedinurl || !room_id) {
        return res
          .status(404)
          .json({ message: "Please fill all the details!" });
      } else {
        let api_endpoint = "https://nubela.co/proxycurl/api/v2/linkedin";
        let api_key = "KACjAo1P9CCVtdfMrz8aEA";
        let params = {
          url: linkedinurl,
          skills: "include",
        };

        let configuration = {
          headers: {
            Authorization: `Bearer ${api_key}`, // ProxyCurl API key
            "Content-Type": "application/json",
          },
          params: params,
        };
        // try {
        //   console.log("Data ready!");
        //   // const userdata = await axios.get(api_endpoint,config=configuration).then((data)=>{
        //   //   return res.status(200).json({ data: data.data });
        //   // }).catch((err)=>{
        //   //   console.log(err);
        //   //  return res.status(500).json({ message: "Please fill all the details! " + err });
        //   // });
        // } catch (error) {
        //   console.log(error);
        //   return res.status(500).json({ message: "Internal server error: " + error });
        // }
      }
      const about = userdata.data.summary;
      if (Object.keys(userdata.data).length <= 3) {
        return res
          .status(404)
          .json({ message: "Not enough data to create a team!" });
      } else {
        const experiences = userdata.data.experiences;
        let final_experiences = "";
        for (let i = 0; i < experiences.length; i++) {
          final_experiences += `${userdata.data.experiences[i].company} ${userdata.data.experiences[i].title} ${userdata.data.experiences[i].description}`;
        }
        const sentence = final_experiences;

        //  Extract the keywords
        const extraction_result = keyword_extractor.extract(sentence, {
          language: "english",
          remove_digits: true,
          return_changed_case: true,
          remove_duplicates: false,
        });
        try {
          await Users.create({'name':userdata.data.full_name,'linkedin_url':linkedinurl,'keywords':extraction_result,'about':userdata.data.summary,'room_id':room_id}).then((data) => {
            return res.status(200).json({ message: 'User created successfully!' });
          }).catch(err => {
            return res.status(500).json({message: 'Internal server error!'});
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      }
    },
    async matcher(req,res){
      console.log("IO");
      try {
        const data_lake = await Users.find();
        if(data_lake.length < 1){
          return res.status(404).json({ message: 'No users in the data lake!' });
        }else{
          var abouts = [];
          for(let i=0; i<data_lake.length; i++){
            abouts.push(data_lake[i].about);
          }
          // const featureExtractor = await pipeline('feature-extraction', 'Xenova/bert-base-uncased');
          // const embedding = await featureExtractor(abouts);
          // return res.status(200).json({message: embedding});
        }
        return res.status(200).json({ message: data_lake});
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  };
}

module.exports = MainContoller;
