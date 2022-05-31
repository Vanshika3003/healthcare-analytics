// 1. Import dependencies
import { Sequelize } from "sequelize";

import jsonwebtoken from "jsonwebtoken";

import pkg from "sequelize";
const { DataTypes } = pkg;
// 2. Database Mapping Metadata
// 2a. Model Mapping
import usertable from "../models/usertable.js";
import role from "../models/role.js";
import ward from "../models/ward.js";
import room from "../models/room.js";
import admitpatient from "../models/admitpatient.js";
import observationonpatient from "../models/observationonpatient.js"
import recordpatientdetail from "../models/recordpatientdetail.js"
import generatebill from '../models/generatebill.js'
import doctor from '../models/doctor.js'

// 2b. Sequelize Connection
const sequelize = new Sequelize("healthcare", "vanshika", "vk123", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
});
// 2c. Authentication (async)
sequelize.authenticate().then(
  (authenticate) => {
    console.log(`Connected to DB Successfully.... ${authenticate}`);
  },
  (error) => {
    console.log(`failed....${error}`);
  }
);

// lets define signature

const jwtSettings = {
  jwtSecret: "msit007700itms",
};

//create user access rights
// let accessRights = [
//   { username: "Admin", permissions: ["Create", "Update", "Delete", "Read"] },
//   { username: "GK", permissions: ["Create", "Update", "Delete", "Read"] },

// ];
let accessRights = [
  { roleid: 1, permissions: ["Create", "Update", "Delete", "Read"] },
  // { username:"doctor", permissions: ["Create", "Update", "Delete", "Read"]}
  //   ,
  { roleid: 5, permissions: ["Create", "Update", "Delete", "Read"] },
  { roleid: 4, permissions: ["Create", "Update", "Delete", "Read"] }
];
// 3. Data Access Class
class DataAccess {
  // Lets initialize the Mapping between Model class and Table using sequelize
  // generated model
  // This will establish connection to Database and resolve ES 6 DataTypes
  constructor() {
    usertable.init(sequelize, DataTypes);
    role.init(sequelize, DataTypes);
    ward.init(sequelize, DataTypes);
    room.init(sequelize, DataTypes);
    admitpatient.init(sequelize, DataTypes);
    observationonpatient.init(sequelize, DataTypes);
    recordpatientdetail.init(sequelize, DataTypes);
    generatebill.init(sequelize, DataTypes);
    doctor.init(sequelize, DataTypes);

  }

  // async loginUser(req, res) {
  //   let uname = req.body.username;
  //   let pass = req.body.password;
  //   // 1. Synchronize with DB using sequelize object
  //   // do not overwrite DB
  //   await sequelize.sync({ force: false });
  //   let record = await usertable.findOne({ where: { username: uname, password: pass } });
  //   if (record === null)
  //     return res
  //       .status(404)
  //       .send({ message: `User ${uname} is not exists` });
  //   // 2b. Check for the password
  //   if (record.password !== pass.trim())
  //     return res.status(401).send({ message: `Password does not match` });
  //   let userAccessRights = accessRights.filter(
  //     (val) => val.username === uname
  //   )[0].permissions;
  //   let u = uname;
  //   // 3. Authenticate the user and issue token
  //   // do not pass the password
  //   const token = jsonwebtoken.sign(
  //     { u, userAccessRights },
  //     jwtSettings.jwtSecret,
  //     {
  //       expiresIn: 3600, // 1 hr
  //       algorithm: "HS384",
  //     }
  //   );
  //   // 4. return token to client
  //   res.status(200).send({
  //     message: `User ${uname} is successfully authenticated`,
  //     token: token,
  //     uname: uname
  //   });
  // }
  async loginUser(req, res) {
    let uname = req.body.username;
    let pass = req.body.password;
    let role = req.body.roleid;
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    let record = await usertable.findOne({ where: { username: uname, password: pass, roleid: role } });
    if (record === null)
      return res
        .status(404)
        .send({ message: `User ${uname} is not exists` });
    // 2b. Check for the password
    if (record.password !== pass.trim())
      return res.status(401).send({ message: `Password does not match` });


    let userAccessRights = accessRights.filter(
      (val) => val.roleid === role
    )[0].permissions;
    console.log(`user access = ${userAccessRights}`);
    let u = role;
    // 3. Authenticate the user and issue token
    // do not pass the password
    const token = jsonwebtoken.sign(
      { u, userAccessRights },
      jwtSettings.jwtSecret,
      {
        expiresIn: 3600, // 1 hr
        algorithm: "HS384",
      }
    );
    // 4. return token to client
    res.status(200).send({
      message: `User ${uname} is successfully authenticated`,
      token: token,
      uname: uname,
      role: role
    });

  }

  async createNewUser(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist
        let findRole = await role.findOne({
          where: { rolename: userBody.roleid },
        });
        if (findRole !== null)
          return resp
            .status(409)
            .send({ message: `Role ${userBody.roleid} is already exists` });
        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          let created = await usertable.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async addWard(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist

        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          let created = await ward.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async addRoom(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist

        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          let findWard = await ward.findOne({ where: { id: userBody.wardid } });
          // console.log(`findward is ${findWard} and ${findWard.id}`);
          if (findWard === null) {
            return resp
              .status(500)
              .send({ message: "Ward does not exist" });
          }
          //if(findWard.id === userBody.wardid){
          let created = await room.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async admitPatient(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist

        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          let findWard = await ward.findOne({ where: { id: userBody.wardid } });
          let findRoom = await room.findOne({ where: { id: userBody.roomid } });
          let findPatient = await usertable.findOne({ where: { id: userBody.userid, roleid: 6 } });
          // console.log(`findward is ${findWard} and ${findWard.id}`);
          if (findWard === null) {
            return resp
              .status(500)
              .send({ message: "Ward does not exist" });
          }
          if (findRoom === null) {
            return resp
              .status(500)
              .send({ message: "Room does not exist" });
          }
          if (findPatient === null) {
            return resp
              .status(500)
              .send({ message: "Patient does not exist" });
          }
          //if(findWard.id === userBody.wardid){
          let created = await admitpatient.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async observationOnPatient(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist

        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          //  let findWard = await ward.findOne({ where: { id: userBody.wardid }});
          //  let findRoom = await room.findOne({ where: { id: userBody.roomid }});
          let findPatient = await usertable.findOne({ where: { id: userBody.userid, roleid: 6 } });
          // console.log(`findward is ${findWard} and ${findWard.id}`);

          if (findPatient === null) {
            return resp
              .status(500)
              .send({ message: "Patient does not exist" });
          }
          //if(findWard.id === userBody.wardid){
          let created = await observationonpatient.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async recordPatientDetail(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist

        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          //  let findWard = await ward.findOne({ where: { id: userBody.wardid }});
          //  let findRoom = await room.findOne({ where: { id: userBody.roomid }});
          let findPatient = await usertable.findOne({ where: { id: userBody.userid, roleid: 6 } });
          // console.log(`findward is ${findWard} and ${findWard.id}`);

          if (findPatient === null) {
            return resp
              .status(500)
              .send({ message: "Patient does not exist" });
          }
          //if(findWard.id === userBody.wardid){
          let created = await recordpatientdetail.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );

  }
  async generateBill(req, resp) {
    const userBody = req.body;
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist

        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          //  let findWard = await ward.findOne({ where: { id: userBody.wardid }});
          //  let findRoom = await room.findOne({ where: { id: userBody.roomid }});
          let findPatient = await usertable.findOne({ where: { id: userBody.userid, roleid: 6 } });
          // console.log(`findward is ${findWard} and ${findWard.id}`);
          // let totalAmount = req.body.roombill + req.body.doctorvisitbill + req.body.medicinebill +
          // req.body.nursebill + req.body.cleaningcharges + req.body.pathologycharges + req.body.radiologycharges;
          if (findPatient === null) {
            return resp
              .status(500)
              .send({ message: "Patient does not exist" });
          }

          //if(findWard.id === userBody.wardid){
          let created = await generatebill.create(userBody);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async getWardWisePatient(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select firstname,lastname,wardname from ward inner join admitpatient on ward.id=admitpatient.wardid inner join usertable on usertable.id = admitpatient.userid");
    console.log(`result is ${JSON.stringify(records[0][0])}`);
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0][0] });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  async getWardWiseRoom(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select wardname,roomno from ward inner join room on ward.id=room.wardid ");
    console.log(`result is ${JSON.stringify(records[0][0])}`);
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0] });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  async getDoctorWisePatient(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select firstname,lastname,doctorid,doctorname from doctor inner join admitpatient on doctor.id = admitpatient.doctorid inner join usertable on usertable.id = admitpatient.userid ");
    console.log(`result is ${JSON.stringify(records[0][0])}`);
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0] });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  async getAllAdmittedPatient(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select firstname,wardname,roomno,status from admitpatient inner join usertable on admitpatient.userid = usertable.id inner join  ward on admitpatient.wardid = ward.id inner join room on admitpatient.roomid = room.id");
    console.log(`result is ${JSON.stringify(records[0][0])}`);
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0] });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  async getWardWiseNurse(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select wardname,nursename from ward inner join nurse on ward.id=nurse.wardid ");
    console.log(`result is ${JSON.stringify(records[0][0])}`);
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0] });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }

  async searchPatients(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    let patientname = req.params.id;
    let roomid = req.params.roomid;
    let wardid = req.params.wardid
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select firstname,wardname,roomno,status from admitpatient inner join usertable on admitpatient.userid = usertable.id inner join  ward on admitpatient.wardid = ward.id inner join room on admitpatient.roomid = room.id where firstname='" + patientname + "' and roomid='" + roomid + "' and admitpatient.wardid='" + wardid + "'");
    console.log(`result is ${JSON.stringify(records)}`);
    if (records[0].length === 0) {
      return resp
        .status(500)
        .send({ message: "Patient doesn't exist" });
    }
    // 3. send response
    else if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0] });
    }

  }
  async createNewDoctor(req, resp) {
    const userBody = req.body;
    console.log(`Role========== ${userBody.roleid}`);
    console.log("users " + JSON.stringify(userBody));
    await sequelize.sync({ force: false });
    // 2a. check if the request has the authorization header
    if (!req.headers.authorization) {
      return resp
        .status(400)
        .send({ message: "Request is missing the headers info" });
    }

    // 2b. Read the Headers data

    let headers = req.headers.authorization; // Bearer Token-Value
    // 2c. split header value
    let receivedToken = headers.split(" ")[1]; // Bearer Token-Value, [1] means a token value
    console.log(` ${receivedToken}`);

    // 2d. Lets verify the token
    // Parameter 1: Token
    // Parameter 2: The Secret aka Signature
    // Parameter 3: The Decode callback for success or failure of token verification
    await jsonwebtoken.verify(
      receivedToken,
      jwtSettings.jwtSecret,
      async (error, decode) => {
        if (error) {
          return resp
            .status(401)
            .send({ message: `The Identity Verification Failed` });
        }
        console.log(`Decode = ${JSON.stringify(decode)}`);
        console.log(`Decode u = ${JSON.stringify(decode.u)}`);
        // 3. read all records
        // inform the Hosting server that the current token is validated and successfully decoded+
        // the decode contains the Token Information like, Payload (identity info, roles, etc.) and expiry
        // We can use the payload info to decide whether to process the request
        //CHECK if the role already exist
        // let findRole = await role.findOne({
        //   where: { id: userBody.roleid },
        // });
        // if (findRole !== null)
        //   return resp
        //     .status(409)
        //     .send({ message: `Role ${userBody.roleid} is already exists` });
        // create role by admin
        if (JSON.stringify(decode.u) !== "Admin") {
          let created = sequelize.query("insert into usertable values ('" + req.body.id + "','" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.username + "','" + req.body.password + "','" + req.body.roleid + "','" + req.body.emailid + "','" + req.body.mobileno + "')")
          let record = sequelize.query("insert into doctor(id,doctorname,specialization,userid) values ('" + req.body.id + "','" + req.body.doctorname + "','" + req.body.specialization + "','" + req.body.userid + "')")
          console.log(`records ${JSON.stringify(record)}`);
          if (created !== null)
            return resp
              .status(201)
              .send({
                message: `Usre ${JSON.stringify(userBody)} is created successfully`,
              });
        } else {
          return resp
            .status(500)
            .send({ message: "Only Admin can create new role" });
        }
      }
    );
  }
  async getPatientData(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    let records = await usertable.findAll({ order: sequelize.literal('id ASC'), where: { roleid: 6 } });
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  //get all ward data
  async getWardData(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    let records = await ward.findAll({ order: sequelize.literal('id ASC') });
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  //get all room data
  async getRoomData(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    let records = await room.findAll({ order: sequelize.literal('id ASC') });
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  //get all docotrs data
  async getDoctorData(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    let records = await doctor.findAll({ order: sequelize.literal('id ASC') });
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
  async getAllObservedPatients(req, resp) {
    // 1. Synchronize with DB using sequelize object
    // do not overwrite DB
    await sequelize.sync({ force: false });
    // 2. read all records
    // let records = await department.findAll({order:sequelize.literal('deptno ASC')});
    let records = await sequelize.query("select firstname,username,prescription,status,disease from usertable inner join observationonpatient  on usertable.id=observationonpatient.userid inner join  admitpatient on usertable.id=admitpatient.userid");
    console.log(`result is ${JSON.stringify(records[0][0])}`);
    // 3. send response
    if (records) {
      return resp
        .status(200)
        .send({ message: "Data is read successfully", data: records[0] });
    }
    return resp
      .status(500)
      .send({ message: "Error Occured while reading data" });
  }
}

export default DataAccess;
