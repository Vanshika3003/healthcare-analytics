import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class doctor extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doctorname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    specialization: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    userid: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      references: {
        model: 'usertable',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'doctor',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "doctor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
