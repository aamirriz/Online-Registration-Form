const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/youtuberegistration", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`connection successful`);
  })
  .catch((error) => {
    console.log(error);
  });
