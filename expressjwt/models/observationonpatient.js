import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class observationonpatient extends Model {
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
    prescription: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'observationonpatient',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "observationonpatient_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
