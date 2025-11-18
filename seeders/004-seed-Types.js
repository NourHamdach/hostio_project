"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Types", [
      { typeName: "Bakery" },
      { typeName: "Coffee Shop" },
      { typeName: "Restaurant" },
      { typeName: "Café" },
      { typeName: "Bar" },
      { typeName: "Pub" },
      { typeName: "Hotel" },
      { typeName: "Resort" },
      { typeName: "Bed and Breakfast" },
      { typeName: "Guest House" },
      { typeName: "Motel" },
      { typeName: "Fast Food" },
      { typeName: "Fine Dining" },
      { typeName: "Food Truck" },
      { typeName: "Catering Service" },
      { typeName: "Event Venue" },
      { typeName: "Spa" },
      { typeName: "Nightclub" },
      { typeName: "Lounge" },
      { typeName: "Brunch Spot" },
      { typeName: "Ice Cream Parlor" },
      { typeName: "Pizzeria" },
      { typeName: "Steakhouse" },
      { typeName: "Sushi Bar" },
      { typeName: "Brewery" },
      { typeName: "Tavern" },
      { typeName: "Bistro" },
      { typeName: "Diner" },
      { typeName: "Catering Company" },
      { typeName: "Food Delivery Service" },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Types", null, {});
  },
};
