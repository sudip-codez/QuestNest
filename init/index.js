const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/questnest";
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(console.log("connected to DB"))
  .catch((e) => console.log("ERROR in connecting to DB: ", e));
async function main() {
  await mongoose.connect(MONGO_URL);
}
const dataInitProcess = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: '669d168c04ae12d33744ebf1',
    }));
    console.log("DB successfully initialized");
    await Listing.insertMany(initData.data);
  } catch (e) {
    console.log("ERROR in initialising DB", e);
  }
};
dataInitProcess();
