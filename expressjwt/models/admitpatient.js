import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class admitpatient extends Model {
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
    wardid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: 'ward',
        key: 'id'
      }
    },
    roomid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: 'room',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    disease: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    doctorid: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      references: {
        model: 'usertable',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'admitpatient',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "admitpatient_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
