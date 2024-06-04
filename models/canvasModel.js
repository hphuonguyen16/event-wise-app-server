const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available",
  },
  tier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tier",
  },
  type: String,
  sectionId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//populate tier in seats sections.subsections.seats_by_rows

// const seatSchema = new mongoose.Schema({
//   name: String,
//   status: {
//     type: String,
//     enum: ["available", "reserved", "sold"],
//     default: "available",
//   },
//   tier: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Tier",
//   },
//   type: String,
//   sectionId: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });



const subsectionSchema = new mongoose.Schema({
  section_id: String,
  seats_by_rows: {
    type: Map,
    of: [seatSchema],
  },
});

const sectionSchema = new mongoose.Schema({
  name: String,
  rotation: Number,
  skewX: Number,
  skewY: Number,
  row: String,
  column: String,
  position: {
    x: Number,
    y: Number,
  },
  subsections: [subsectionSchema],
});

const tableSchema = new mongoose.Schema({
  style: String,
  seats: Number,
  endSeats: Number,
  seatsInfo: [seatSchema],
  tablePrefix: String,
  seatPrefix: String,
  size: Number,
  rotation: Number,
  position: {
    x: Number,
    y: Number,
  },
});

const objectSchema = new mongoose.Schema({
  shape: String,
  label: String,
  icon: String,
  width: Number,
  height: Number,
  size: Number,
  rotation: Number,
  position: {
    x: Number,
    y: Number,
  },
});

const textSchema = new mongoose.Schema({
  text: String,
  size: Number,
  rotation: Number,
  position: {
    x: Number,
    y: Number,
  },
});

const canvasSchema = new mongoose.Schema({
  sections: [sectionSchema],
  tables: [tableSchema],
  objects: [objectSchema],
  texts: [textSchema],
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
});

canvasSchema.pre(/^find/, function (next) {
  //populate tier in seats sections.subsections.seats_by_rows
  //populate seatSchema 

  

  this.populate({
    path: "sections.subsections.seats_by_rows.$*",
    populate: {
      path: "tier",
      model: "Tier",
    },
  })
    .populate({
      path: "tables.seatsInfo",
      model: "Seat",
    })
    .populate({
      path: "objects",
      model: "Object",
    })
    .populate({
      path: "texts",
      model: "Text",
    })
    .populate({
      path: "tables.seatsInfo",
      populate: {
        path: "tier",
        model: "Tier",
      },
    });
   
  next();
});

const Canvas = mongoose.model("Canvas", canvasSchema);

module.exports = Canvas;
