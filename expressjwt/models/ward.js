import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ward extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    wardname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    wardinfo: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ward',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ward_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
