import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class usertable extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    roleid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id'
      }
    },
    emailid: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    mobileno: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'usertable',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "usertable_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
