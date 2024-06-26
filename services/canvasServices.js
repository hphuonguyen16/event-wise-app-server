const CanvasModel = require("../models/canvasModel");
const AppError = require("./../utils/appError");
const SeatModel = require("../models/seatSchema");

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


exports.updateSeats = async (eventId, seatsData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = await CanvasModel.findOne({ event: eventId });
      let { sections, tables } = canvas;

      for (const seatData of seatsData) {
        if (seatData.type === "section") {
          sections = sections.map((section) => {
            if (section._id.toString() === seatData.sectionId) {
              section.subsections.forEach((subsection) => {
                const seatsByRows = new Map(subsection.seats_by_rows); // Convert to Map object if it's not already
                for (let [row, seats] of seatsByRows.entries()) {
                  const seatIndex = seats.findIndex(
                    (seat) => seat._id.toString() === seatData._id
                  );
                  if (seatIndex !== -1) {
                    if (seats[seatIndex].status === "sold") {
                      throw new AppError(
                        `The seat ${seats[seatIndex].name} is already sold. Please reload the page to get the latest data.`,
                        400
                      );
                    }
                    seats[seatIndex] = {
                      ...seats[seatIndex],
                      ...seatData,
                    };
                  }
                }

                subsection.seats_by_rows = Array.from(seatsByRows.entries()); // Convert back to array of entries if necessary
              });
            }
            return section;
          });
        } else if (seatData.type === "table") {
          tables = tables.map((table) => {
            if (table._id.toString() === seatData.sectionId) {
              table.seatsInfo = table.seatsInfo.map((seat) => {
                if (seat._id.toString() === seatData._id) {
                  if (seat.status === "sold") {
                    throw new AppError(
                      `The seat ${seat.name} is already sold`,
                      400
                    );
                  }
                  return {
                    ...seat,
                    ...seatData,
                  };
                }
                return seat;
              });
            }
            return table;
          });
        }
      }

      const result = await CanvasModel.findByIdAndUpdate(
        canvas._id,
        {
          sections,
          tables,
        },
        { new: true }
      );

      resolve({
        status: "success",
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};
