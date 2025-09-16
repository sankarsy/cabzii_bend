const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema({
    name: String,
    type: String,
    cabId: {
        type: String,
        unique: true
    },
    cabImages: [String],
    package: {
        oneWay: {
            price: Number,
            offerPrice: Number,
            discount: Number,
            coverage: Number,
            extraKms: Number,
            bata: Number
        },
        roundTrip: {
            price: Number,
            offerPrice: Number,
            discount: Number,
            coverage: Number,
            extraKms: Number,
            bata: Number
        }
    },
    seoTitle: String,
    seoDescription: String
}, {
    timestamps: true
});

const Cab = mongoose.model("Cab", cabSchema);

module.exports = Cab;
