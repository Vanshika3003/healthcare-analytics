import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 7012;

// create an instance
const instance = express();
// Add JSON Middleware in HTTP Pipeline
instance.use(express.json());
// do not parse incoming data other than HTTP Request Message Body
instance.use(express.urlencoded({ extended: false }));
// configure CORS
instance.use(cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*"
}));

// import dataaccess

import DataAccess from './dataaccess/ass-20-april.js'

let ds = new DataAccess();
// lets create REST API
instance.post('/api/login', ds.loginUser);
instance.post('/api/createUser', ds.createNewUser);
instance.post('/api/createWard', ds.addWard);
instance.post('/api/createRoom', ds.addRoom);
instance.post('/api/admitPatient', ds.admitPatient);
instance.post('/api/observPatient', ds.observationOnPatient);
instance.post('/api/recordPatient', ds.recordPatientDetail);
instance.post('/api/generateBill', ds.generateBill);
instance.get('/api/getWardWisePatient', ds.getWardWisePatient);
instance.get('/api/getWardWiseRoom', ds.getWardWiseRoom);
instance.get('/api/getDoctorWisePatient', ds.getDoctorWisePatient);
instance.get('/api/getAllAdmittedPatient', ds.getAllAdmittedPatient);
instance.get('/api/getWardWiseNurse', ds.getWardWiseNurse);
instance.get('/api/searchPatients/:id/:wardid/:roomid', ds.searchPatients);
instance.post('/api/createNewDoctor', ds.createNewDoctor);
instance.get('/api/patients', ds.getPatientData);
instance.get('/api/wards', ds.getWardData);
instance.get('/api/rooms', ds.getRoomData);
instance.get('/api/doctors', ds.getDoctorData);
instance.get('/api/observedPatients', ds.getAllObservedPatients);














// start listening
instance.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
});