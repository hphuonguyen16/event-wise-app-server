const CanvasModel = require("../models/canvasModel");
const AppError = require("./../utils/appError");
const SeatModel = require("../models/seatModel");

exports.createCanvas = async (canvasData) => {
  try {
    const { sections, tables, objects, texts } = canvasData;
    // Iterate over sections and their subsections
    for (const section of sections) {
      for (const subsection of section.subsections) {
        for (let row in subsection.seats_by_rows) {
          const seats = subsection.seats_by_rows[row];

          // Create seats in parallel
          const seatIds = await Promise.all(
            seats.map(async (seatData) => {
              const seat = await SeatModel.create(seatData);
              return seat._id;
            })
          );

          // Replace the seats with their IDs
          subsection.seats_by_rows[row] = seatIds;
        }
      }
    }

    // Create seats for tables in parallel using promises
    await Promise.all(
      tables.map(async (table) => {
        // Initialize an array to hold seat IDs
        const seatIds = [];

        // Ensure seatsInfo is an array
        if (Array.isArray(table.seatsInfo)) {
          // Create seats in parallel
          const seatPromises = table.seatsInfo.map(async (seatData) => {
            const seat = await SeatModel.create(seatData);
            return seat._id;
          });

          // Wait for all seats to be created and collect their IDs
          const createdSeatIds = await Promise.all(seatPromises);
          seatIds.push(...createdSeatIds);
        }

        // Replace the seatsInfo with the array of seat IDs
        table.seatsInfo = seatIds;
      })
    );

    // Create the canvas document
    const canvas = await CanvasModel.create(canvasData);

    return {
      status: "success",
      data: canvas,
    };
  } catch (error) {
    console.error(error);
    throw new AppError("Error creating canvas", 500);
  }
};

exports.getCanvasByEventId = async (eventId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = await CanvasModel.findOne({ event: eventId });
      resolve({
        status: "success",
        data: canvas,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.createOrUpdateCanvas = async (eventId, canvasData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = await CanvasModel.findOne({ event: eventId });
      let result = null;
      if (canvas) {
        result = await CanvasModel.findByIdAndUpdate(canvas._id, canvasData, {
          new: true,
          runValidators: true,
        });
      } else {
        result = await CanvasModel.create(canvasData);
      }
      resolve({
        status: "success",
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};
