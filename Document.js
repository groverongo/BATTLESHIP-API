import {Schema} from "mongoose";

// A sample document from a user
export const userSchema = new Schema({
    // The username 
    _id: String,
    // The password
    password: String,
    // Information about every ships length and position
    shipsInfo: [
        {
            length: Number, // Length of ship
            coordinate: [Number], // Minimum coordinate
            is_horizontal: Boolean // If ship lays in horizontal position
        }
    ]
});