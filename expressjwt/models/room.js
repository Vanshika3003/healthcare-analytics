import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class room extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    roomno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    wardid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: 'ward',
        key: 'id'
      }
    },
    roominfo: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'room',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "room_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
