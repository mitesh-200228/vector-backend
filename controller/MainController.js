require("@tensorflow/tfjs");
const Users = require("../models/Users");
const axios = require("axios");
const userdata = require("../data.json");
const keyword_extractor = require("keyword-extractor");
const use = require("@tensorflow-models/universal-sentence-encoder");
// const tf = require('@tensorflow/tfjs-node');
const math = require('mathjs');

function MainContoller() {
  return {
    async model(req, res) {
      // let userdata;
      const { linkedinurl, room_id } = req.body;
      if (!linkedinurl || !room_id) {
        return res
          .status(404)
          .json({ message: "Please fill all the details!" });
      } else {
        let api_endpoint = "https://nubela.co/proxycurl/api/v2/linkedin";
        let api_key = "yYRj_nqzmPVJwTF5bC7OCA";
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
        //   const userdata_database = await axios.get(api_endpoint, (config = configuration));
        //   userdata = userdata_database;
        // } catch (error) {
        //   console.log(error);

        //   return res
        //     .status(500)
        //     .json({ message: "Internal server error: " + error });
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
          await Users.create({
            name: userdata.data.full_name,
            linkedin_url: linkedinurl,
            keywords: extraction_result,
            about: userdata.data.summary,
            room_id: room_id,
          })
            .then((data) => {
              return res
                .status(200)
                .json({ message: "User created successfully!" });
            })
            .catch((err) => {
              return res
                .status(500)
                .json({ message: "Internal server error!" + err.message});
            });
        } catch (error) {
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    },
    async matcher(req, res) {
      const {linkedin_url,room_id} = req.body;
      try {
        const data_lake = await Users.find({room_id});
        const main_user_about = await Users.find({linkedin_url});
        if (data_lake.length < 1) {
          return res
            .status(404)
            .json({ message: "No users in the data lake!" });
        } else {
          var abouts = [];
          var names = [];
          var linkedin_urls = [];
          for (let i = 0; i < data_lake.length; i++) {
            if(data_lake[i].linkedin_url !== linkedin_url){
              abouts.push(data_lake[i].about);
              names.push(data_lake[i].name);
              linkedin_urls.push(data_lake[i].linkedin_url);
            }
          }
          // console.log(main_user_about);
          
          let similarityMatrix;
          await use.load().then(async (model) => {
            const data = (await model.embed(abouts)).arraySync();
            const user = (await model.embed(main_user_about[0].about)).arraySync();
            similarityMatrix = math.zeros(1,abouts.length);
            for (let i = 0; i < 1; i++) {
              for (let j = 0; j < abouts.length; j++) {
                similarityMatrix.set([i, j], math.dot(user[i], data[j]) / (math.norm(user[i]) * math.norm(data[j])));
              }
            }
            return res.status(200).json({ 'matrix': similarityMatrix, 'name':names, 'linkedin_url':linkedin_urls });
          });
        }
        // return res.status(200).json({ message: data_lake });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Internal Server Error " + error.message });
      }
    },
  };
}

module.exports = MainContoller;