const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
app.use(cors());
app.use(bodyParser.json());

const readData = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file)));
const writeData = (file, data) => fs.writeFileSync(path.join(__dirname, 'data', file), JSON.stringify(data, null, 2));

// -------------------- AUTH --------------------

// 🔐 Login
app.post('/api/auth/login', (req, res) => {
  const users = readData('users.json');
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ token: user.token, role: user.role, name: user.name, email: user.email }); // Ajoutez l'e-mail ici
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// 📝 Registration
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;

  // Validate required fields
  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Initialize files if they don't exist
    const ensureFileExists = (file) => {
      const filePath = path.join(__dirname, 'data', file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
      }
    };
    
    ensureFileExists('users.json');
    ensureFileExists('patients.json');
    ensureFileExists('doctors.json');

    // Read existing data
    let users = [];
    try {
      users = readData('users.json');
    } catch (readError) {
      console.error('Error reading users.json:', readError);
      users = []; // Initialize as empty array if file is corrupted
    }

    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = {
      email,
      password,
      name,
      role,
      token: `mock-${role.toLowerCase()}-${Date.now()}`
    };

    // Handle role-specific registration
    if (role === 'PATIENT') {
      let patients = [];
      try {
        patients = readData('patients.json');
      } catch (e) {
        patients = [];
      }
      patients.push({ email, name });
      writeData('patients.json', patients);
    } else if (role === 'DOCTOR') {
      let doctors = [];
      try {
        doctors = readData('doctors.json');
      } catch (e) {
        doctors = [];
      }
      doctors.push({ 
        email, 
        name, 
        specialization: 'General Practitioner' 
      });
      writeData('doctors.json', doctors);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Add to users.json
    users.push(newUser);
    writeData('users.json', users);

    res.json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error during registration',
      error: error.message 
    });
  }
});
// -------------------- PATIENT --------------------

// 🏠 Patient Dashboard
app.get('/api/patient/dashboard', (req, res) => {
  try {
    // Verify required headers
    const patientEmail = req.headers['x-patient-email'];
    const authToken = req.headers['authorization']?.split(' ')[1];

    if (!patientEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Patient email is required in x-patient-email header' 
      });
    }

    // Read data files
    const users = readData('users.json');
    const appointments = readData('appointments.json');
    const patients = readData('patients.json');

    // Find patient in users
    const patient = users.find(u => u.email === patientEmail && u.role === 'PATIENT');
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // Verify token
    if (patient.token !== authToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    // Find patient in patients.json (additional info)
    const patientInfo = patients.find(p => p.email === patientEmail) || {};

    // Get upcoming appointments (filter and sort)
    const now = new Date();
    const upcomingAppointments = appointments
      .filter(a => a.patientEmail === patientEmail && new Date(a.appointmentDateTime) > now)
      .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
      .map(appt => {
        const doctor = users.find(u => u.email === appt.doctorEmail && u.role === 'DOCTOR');
        return {
          id: appt.id,
          dateTime: appt.appointmentDateTime,
          reason: appt.reason,
          status: appt.status,
          doctorName: doctor ? doctor.name : 'Unknown Doctor'
        };
      });

    res.json({
      success: true,
      name: patient.name,
      email: patient.email,
      patientInfo: patientInfo, // additional patient info if needed
      upcomingAppointments
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// 📅 List of doctors
// 📅 List of doctors - Version corrigée
app.get('/api/doctors', (req, res) => {
  try {
    // Lire uniquement depuis doctors.json
    const doctors = readData('doctors.json');
    
    // Formater la réponse si nécessaire
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id || doctor.email, // Utiliser l'email comme ID si l'id n'existe pas
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || 'General Practitioner'
    }));
    
    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error loading doctors:', error);
    res.status(500).json({ message: 'Error loading doctors list' });
  }
});

// 📅 Book Appointment
app.post('/api/patient/appointments', (req, res) => {
  const appointments = readData('appointments.json');
  const { doctorEmail, appointmentDate, appointmentTime, reason } = req.body;
  const patientEmail = req.headers['x-patient-email'] || req.body.patientEmail;

  if (!doctorEmail || !patientEmail) {
    return res.status(400).json({ message: 'Doctor email and patient email are required' });
  }

  const newAppointment = {
    id: Date.now(),
    doctorEmail,
    patientEmail,
    appointmentDate,
    appointmentTime,
    appointmentDateTime: `${appointmentDate}T${appointmentTime}`,
    reason,
    status: 'PENDING'
  };

  appointments.push(newAppointment);
  writeData('appointments.json', appointments);

  res.json({
    message: 'Appointment booked successfully.',
    appointmentId: newAppointment.id
  });
});

// 📋 Patient Treatment Files
app.get('/api/patient/treatments', (req, res) => {
  const { patientEmail } = req.query;
  const treatments = readData('treatments.json');
  const doctors = readData('doctors.json');

  const patientTreatments = treatments
    .filter(t => t.patientEmail === patientEmail)
    .map(t => ({
      appointmentDate: t.appointmentDate,
      doctorName: doctors.find(d => d.id === t.doctorId)?.name || 'Unknown',
      diagnosis: t.diagnosis,
      prescription: t.prescription
    }));

  res.json(patientTreatments);
});

// -------------------- DOCTOR --------------------

// 🏠 Doctor Dashboard
app.get('/api/doctor/dashboard', (req, res) => {
  try {
    const doctorEmail = req.headers['x-doctor-email'];
    if (!doctorEmail) return res.status(400).json({ message: 'Doctor email is required' });

    const users = readData('users.json');
    const appointments = readData('appointments.json');
    const treatments = readData('treatments.json');

    // 1. Today's appointments
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a =>
      a.doctorEmail === doctorEmail &&
      a.appointmentDateTime?.startsWith(todayStr)
    ).length;

    // 2. Pending validations  
    const pendingValidations = appointments.filter(a =>
      a.doctorEmail === doctorEmail &&
      a.status === 'PENDING'
    ).length;

    // 3. All treatments by this doctor
    const doctorTreatments = treatments.filter(t => t.doctorEmail === doctorEmail);
    const allTreatmentsFormatted = doctorTreatments.map(t => ({
      patientName: t.patientName || users.find(u => u.email === t.patientEmail)?.name || 'Unknown',
      date: t.appointmentDate,
      diagnosis: t.diagnosis
    }));

    res.json({
      name: users.find(u => u.email === doctorEmail)?.name || 'Doctor',
      appointmentsToday: todaysAppointments,
      pendingValidations,
      recentTreatments: allTreatmentsFormatted,
      treatmentsFiledCount: doctorTreatments.length
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 📅 Doctor Appointments List
app.get('/api/doctor/appointments', (req, res) => {
  try {
    const doctorEmail = req.headers['x-doctor-email'];
    if (!doctorEmail) {
      return res.status(400).json({ message: 'Doctor email is required' });
    }

    const appointments = readData('appointments.json');
    const users = readData('users.json');

    const doctorAppointments = appointments.filter(a => a.doctorEmail === doctorEmail);

    const formattedAppointments = doctorAppointments.map(a => {
      const patient = users.find(u => u.email === a.patientEmail);
      return {
        id: a.id,
        patientName: patient ? patient.name : 'Unknown',
        dateTime: a.appointmentDateTime,
        reason: a.reason,
        status: a.status || 'PENDING'
      };
    });

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Validate Appointment
app.put('/api/doctor/appointments/:id/validate', (req, res) => {
  const appointments = readData('appointments.json');
  const id = parseInt(req.params.id);

  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ message: 'Appointment not found' });

  appointments[index].status = 'VALIDATED';
  writeData('appointments.json', appointments);

  res.json({ message: 'Appointment validated.' });
});

// 🧾 Get Appointment Info
app.get('/api/doctor/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointments = readData('appointments.json');
  const appointment = appointments.find(a => a.id === id);

  if (!appointment) return res.status(404).json({ message: 'Not found' });

  const users = readData('users.json');
  const patient = users.find(u => u.email === appointment.patientEmail);

  res.json({
    patientName: patient?.name || 'Unknown',
    dateTime: appointment.dateTime,
    reason: appointment.reason
  });
});

// 🧾 Submit Treatment File
// 🧾 Submit Treatment File - Updated Version
  // 💊 Enregistrer un traitement (par un médecin)
// 🧾 Submit Treatment File - Version corrigée
app.post('/api/doctor/treatments', (req, res) => {
  try {
    const doctorEmail = req.headers['x-doctor-email'];
    if (!doctorEmail) {
      return res.status(400).json({ message: 'Doctor email is required in headers' });
    }

    const treatments = readData('treatments.json');
    const appointments = readData('appointments.json');
    const users = readData('users.json');

    const { appointmentId, diagnosis, prescription } = req.body;

    // Validation des champs requis
    if (!appointmentId || !diagnosis || !prescription) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Trouver le rendez-vous
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Créer le traitement
    const newTreatment = {
      id: Date.now(),
      doctorEmail,
      patientEmail: appointment.patientEmail,
      patientName: users.find(u => u.email === appointment.patientEmail)?.name || 'Unknown',
      appointmentId,
      appointmentDate: appointment.appointmentDateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
      diagnosis,
      prescription,
      createdAt: new Date().toISOString()
    };

    treatments.push(newTreatment);
    writeData('treatments.json', treatments);

    res.json({ 
      message: 'Treatment file saved successfully',
      treatment: newTreatment
    });
  } catch (error) {
    console.error('Error saving treatment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.listen(PORT, () => console.log(`Mock server running at http://localhost:${PORT}`));
