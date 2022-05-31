import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class generatebill extends Model {
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
    roombill: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doctorvisitbill: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    medicinebill: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    nursebill: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    cleaningcharges: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    pathologycharges: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    radiologicharges: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    totalamount: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'generatebill',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "generatebill_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
