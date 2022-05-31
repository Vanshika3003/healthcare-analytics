import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _doctor from  "./doctor.js";

export default function initModels(sequelize) {
  const doctor = _doctor.init(sequelize, DataTypes);

  doctor.belongsTo(usertable, { as: "user", foreignKey: "userid"});
  usertable.hasMany(doctor, { as: "doctors", foreignKey: "userid"});

  return {
    doctor,
  };
}
