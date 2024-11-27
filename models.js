import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("sqlite:data/db.sqlite", { logging: false });

export const Cat = sequelize.define("Cat", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

await sequelize.sync({ alter: true });
