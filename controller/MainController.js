const Users = require("../models/Users");
// const userdata = require("../data.json");
const keyword_extractor = require("keyword-extractor");
const math = require("mathjs");
const axios = require("axios");
const Rooms = require("../models/Rooms");
const { default: mongoose } = require("mongoose");

function MainContoller() {
  return {
    async model(req, res) {
      let userdata;
      const { linkedinurl, room_id } = req.body;
      if (!linkedinurl || !room_id) {
        return res
          .status(404)
          .json({ message: "Please fill all the details!" });
      }
      try {
        await Rooms.findById(`${room_id}`)
          .then(async(data) => {
            if (data.length < 1) {
              return res.status(404).json({ message: "Wrong Room Number" });
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
              try {
                const userdata_database = await axios.get(api_endpoint, (config = configuration));
                userdata = userdata_database;
              } catch (error) {
                console.log(error);

                return res
                  .status(500)
                  .json({ message: "Internal server error: " + error });
              }
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

              async function triggers() {
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
                    return res.status(500).json({
                      message: "Internal server error!" + err.message,
                    });
                  });
              }
              triggers();
            }
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ message: "Internal server error" + err.message });
          });
      } catch (err) {
        return res
          .status(404)
          .json({ message: "Internal server error" + err.message });
      }
    },
    async matcher(req, res) {
      const { linkedin_url, room_id } = req.body;
      var abouts = [];
      var names = [];
      var linkedin_urls = [];
      let data_lake, main_user_about;
      try {
        data_lake = await Users.find({ room_id });        
        main_user_about = await Users.find({ linkedin_url });
        if (data_lake.length < 1) {
          return res
            .status(200)
            .json({ message: "No users in the data lake!" });
        } else {
          for (let i = 0; i < data_lake.length; i++) {
            if (data_lake[i].linkedin_url !== linkedin_url) {
              abouts.push(data_lake[i].about);
              names.push(data_lake[i].name);
              linkedin_urls.push(data_lake[i].linkedin_url);
            }
          }
        }
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Internal Server Error " + error });
      }
      const sentences = abouts;
      function cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
      }
      let x = abouts;
      x.push(main_user_about[0].about);
      try {
      const embeddings = await Promise.all(
        sentences.map(async (sentence) => {
          const response = await axios.post(
            "https://api.openai.com/v1/embeddings",
            { model: "text-embedding-ada-002", input: sentence },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
            }
          );
          return response.data.data[0].embedding;
        })
      );
      const similarityMatrix = embeddings.map((embeddingA) =>
        cosineSimilarity(embeddings[embeddings.length - 1], embeddingA)
      );
      // return res.status(200).json({
      //   matrix: [0.7736036995470287, 0.7458996094393071, 1, 1],
      //   names: ["Siddhant Patole", "Souvik Sengupta", "Mitesh Bediya"],
      // });
      return res.status(200).json({ matrix: similarityMatrix, names });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to calculate similarity matrix." + error });
      }
    },
    async rooms(req, res) {
      const { linkedin_url, room_name, room_description } = req.body;
      if (!room_name || !room_description) {
        return res
          .status(404)
          .json({ message: "Send Room Name Details Please!" });
      }
      let People = [];
      let newPeople = [linkedin_url];
      try {
        await Rooms.create({
          room_name,
          room_description,
          People: People + newPeople,
        })
          .then((stat) => {
            return res.status(200).json({ message: stat });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ message: "Internal server error" + err.message });
          });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Internal server error" + err.message });
      }
    },
    async fetchAllRoom(req, res) {
      try {
        await Rooms.find()
          .then((stat) => {
            return res.status(200).json({ message: stat });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ message: "Internal server error" + err.message });
          });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Internal server error" + err.message });
      }
    },
  };
}

module.exports = MainContoller;
