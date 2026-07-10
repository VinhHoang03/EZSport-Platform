import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/user.model";
import Venue from "../models/venue.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vinhhoangdev:03072005@cluster0-hoangvinh.msq1gzg.mongodb.net/EZSport?retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB!");
  const user = await User.findOne({ username: "Tony123" });
  if (user) {
    console.log("User Found:", {
      username: user.username,
      fullName: user.fullName,
      venueIds: user.venueIds,
    });
    if (user.venueIds && user.venueIds.length > 0) {
      const venues = await Venue.find({ _id: { $in: user.venueIds } });
      console.log("Linked Venues:", venues.map(v => ({ id: v._id, name: v.name })));
    }
  } else {
    console.log("User Tony123 not found!");
  }
  await mongoose.disconnect();
}

main();
