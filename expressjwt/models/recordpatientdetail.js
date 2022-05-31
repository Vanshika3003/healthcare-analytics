import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class recordpatientdetail extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: 'usertable',
        key: 'id'
      }
    },
    medicinename: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    injection: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'recordpatientdetail',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "recordpatientdetail_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
