-- ============================================================
-- HealthSync Demo Seed Data
-- Run: docker exec -i prescription_db psql -U prescription_user -d prescription_system < seed_demo.sql
-- All passwords are: Demo@1234
-- Requires pgcrypto extension (auto-created below)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==================== HOSPITALS ====================
INSERT INTO hospitals (name, address, city, state, zip_code, phone, email, website, created_at, updated_at) VALUES
('Dhaka Medical College Hospital', 'Bakshibazar, Dhaka-1000', 'Dhaka', 'Dhaka', '1000', '+8802-55165088', 'info@dmch.gov.bd', 'https://dmch.gov.bd', NOW(), NOW()),
('Square Hospital', '18/F Bir Uttam Qazi Nuruzzaman Sarak', 'Dhaka', 'Dhaka', '1205', '+88010-7610011', 'info@squarehospital.com', 'https://squarehospital.com', NOW(), NOW()),
('United Hospital Limited', 'Plot 15, Road 71, Gulshan', 'Dhaka', 'Dhaka', '1212', '+88028836444', 'info@uhbd.com', 'https://uhbd.com', NOW(), NOW()),
('Chittagong Medical College Hospital', 'K.B. Fazlul Kader Road, Panchlaish', 'Chittagong', 'Chittagong', '4203', '+880312550137', 'info@cmch.gov.bd', 'https://cmch.gov.bd', NOW(), NOW()),
('Apollo Hospitals Dhaka', 'Plot 81, Block E, Bashundhara R/A', 'Dhaka', 'Dhaka', '1229', '+88029841444', 'info@apollodhaka.com', 'https://apollodhaka.com', NOW(), NOW());

-- ==================== USERS (Doctors) ====================
-- Password: Demo@1234  (BCrypt hash)
INSERT INTO users (name, email, password_hash, phone, role, is_verified, birth_date, gender, created_at, updated_at) VALUES
('Dr. Arif Rahman', 'arif.rahman@healthsync.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801711234567', 'DOCTOR', true, '1978-03-15', 'MALE', NOW() - INTERVAL '2 years', NOW()),
('Dr. Nadia Islam', 'nadia.islam@healthsync.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801822345678', 'DOCTOR', true, '1982-07-22', 'FEMALE', NOW() - INTERVAL '18 months', NOW()),
('Dr. Karim Hossain', 'karim.hossain@healthsync.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801933456789', 'DOCTOR', true, '1975-11-08', 'MALE', NOW() - INTERVAL '14 months', NOW()),
('Dr. Sumaiya Begum', 'sumaiya.begum@healthsync.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801644567890', 'DOCTOR', true, '1985-04-30', 'FEMALE', NOW() - INTERVAL '10 months', NOW()),
('Dr. Tanvir Ahmed', 'tanvir.ahmed@healthsync.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801755678901', 'DOCTOR', true, '1980-09-14', 'MALE', NOW() - INTERVAL '8 months', NOW());

-- ==================== USERS (Patients) ====================
INSERT INTO users (name, email, password_hash, phone, role, is_verified, birth_date, gender, created_at, updated_at) VALUES
('Rahim Uddin',      'rahim.uddin@gmail.com',    crypt('Demo@1234', gen_salt('bf', 10)), '+8801912345678', 'PATIENT', true,  '1990-06-12', 'MALE',   NOW() - INTERVAL '1 year',    NOW()),
('Fatema Khatun',    'fatema.khatun@gmail.com',  crypt('Demo@1234', gen_salt('bf', 10)), '+8801823456789', 'PATIENT', true,  '1995-02-28', 'FEMALE', NOW() - INTERVAL '11 months', NOW()),
('Mohammad Hasan',   'mohammad.hasan@gmail.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801734567890', 'PATIENT', true,  '1988-08-05', 'MALE',   NOW() - INTERVAL '9 months',  NOW()),
('Ruksana Akter',    'ruksana.akter@gmail.com',  crypt('Demo@1234', gen_salt('bf', 10)), '+8801645678901', 'PATIENT', true,  '1992-12-17', 'FEMALE', NOW() - INTERVAL '7 months',  NOW()),
('Jahangir Alam',    'jahangir.alam@gmail.com',  crypt('Demo@1234', gen_salt('bf', 10)), '+8801556789012', 'PATIENT', true,  '1985-04-20', 'MALE',   NOW() - INTERVAL '6 months',  NOW()),
('Shahnaz Parvin',   'shahnaz.parvin@gmail.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801467890123', 'PATIENT', true,  '1998-10-03', 'FEMALE', NOW() - INTERVAL '5 months',  NOW()),
('Aminul Islam',     'aminul.islam@gmail.com',   crypt('Demo@1234', gen_salt('bf', 10)), '+8801378901234', 'PATIENT', false, '1972-07-15', 'MALE',   NOW() - INTERVAL '4 months',  NOW()),
('Nasrin Sultana',   'nasrin.sultana@gmail.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801289012345', 'PATIENT', true,  '2000-01-25', 'FEMALE', NOW() - INTERVAL '3 months',  NOW()),
('Delwar Hossain',   'delwar.hossain@gmail.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801190123456', 'PATIENT', true,  '1968-05-30', 'MALE',   NOW() - INTERVAL '2 months',  NOW()),
('Laila Begum',      'laila.begum@gmail.com',    crypt('Demo@1234', gen_salt('bf', 10)), '+8801501234567', 'PATIENT', true,  '1980-09-11', 'FEMALE', NOW() - INTERVAL '1 month',   NOW());

-- ==================== DOCTORS table ====================
INSERT INTO doctors (user_id, license_number, specialization, institute, created_at, updated_at)
SELECT u.id,
       CASE u.email
         WHEN 'arif.rahman@healthsync.com'   THEN 'BMDC-12345'
         WHEN 'nadia.islam@healthsync.com'   THEN 'BMDC-23456'
         WHEN 'karim.hossain@healthsync.com' THEN 'BMDC-34567'
         WHEN 'sumaiya.begum@healthsync.com' THEN 'BMDC-45678'
         WHEN 'tanvir.ahmed@healthsync.com'  THEN 'BMDC-56789'
       END,
       CASE u.email
         WHEN 'arif.rahman@healthsync.com'   THEN 'Cardiology'
         WHEN 'nadia.islam@healthsync.com'   THEN 'Neurology'
         WHEN 'karim.hossain@healthsync.com' THEN 'General Medicine'
         WHEN 'sumaiya.begum@healthsync.com' THEN 'Pediatrics'
         WHEN 'tanvir.ahmed@healthsync.com'  THEN 'Dermatology'
       END,
       CASE u.email
         WHEN 'arif.rahman@healthsync.com'   THEN 'Square Hospital'
         WHEN 'nadia.islam@healthsync.com'   THEN 'Dhaka Medical College Hospital'
         WHEN 'karim.hossain@healthsync.com' THEN 'United Hospital Limited'
         WHEN 'sumaiya.begum@healthsync.com' THEN 'Apollo Hospitals Dhaka'
         WHEN 'tanvir.ahmed@healthsync.com'  THEN 'Chittagong Medical College Hospital'
       END,
       NOW(), NOW()
FROM users u
WHERE u.email IN ('arif.rahman@healthsync.com','nadia.islam@healthsync.com','karim.hossain@healthsync.com','sumaiya.begum@healthsync.com','tanvir.ahmed@healthsync.com')
ON CONFLICT (user_id) DO UPDATE SET
  license_number = EXCLUDED.license_number,
  specialization  = EXCLUDED.specialization,
  institute       = EXCLUDED.institute,
  updated_at      = NOW();

-- ==================== PATIENTS table ====================
INSERT INTO patients (user_id, height_cm, weight_kg, blood_type, created_at, updated_at)
SELECT u.id,
       CASE u.email
         WHEN 'rahim.uddin@gmail.com'    THEN 172 WHEN 'fatema.khatun@gmail.com'  THEN 158
         WHEN 'mohammad.hasan@gmail.com' THEN 175 WHEN 'ruksana.akter@gmail.com'  THEN 162
         WHEN 'jahangir.alam@gmail.com'  THEN 168 WHEN 'shahnaz.parvin@gmail.com' THEN 155
         WHEN 'aminul.islam@gmail.com'   THEN 170 WHEN 'nasrin.sultana@gmail.com' THEN 160
         WHEN 'delwar.hossain@gmail.com' THEN 165 WHEN 'laila.begum@gmail.com'    THEN 157
       END,
       CASE u.email
         WHEN 'rahim.uddin@gmail.com'    THEN 68  WHEN 'fatema.khatun@gmail.com'  THEN 54
         WHEN 'mohammad.hasan@gmail.com' THEN 80  WHEN 'ruksana.akter@gmail.com'  THEN 58
         WHEN 'jahangir.alam@gmail.com'  THEN 73  WHEN 'shahnaz.parvin@gmail.com' THEN 50
         WHEN 'aminul.islam@gmail.com'   THEN 78  WHEN 'nasrin.sultana@gmail.com' THEN 52
         WHEN 'delwar.hossain@gmail.com' THEN 82  WHEN 'laila.begum@gmail.com'    THEN 60
       END,
       CASE u.email
         WHEN 'rahim.uddin@gmail.com'    THEN 'A_POSITIVE'  WHEN 'fatema.khatun@gmail.com'  THEN 'B_POSITIVE'
         WHEN 'mohammad.hasan@gmail.com' THEN 'O_POSITIVE'  WHEN 'ruksana.akter@gmail.com'  THEN 'AB_POSITIVE'
         WHEN 'jahangir.alam@gmail.com'  THEN 'A_NEGATIVE'  WHEN 'shahnaz.parvin@gmail.com' THEN 'O_NEGATIVE'
         WHEN 'aminul.islam@gmail.com'   THEN 'B_NEGATIVE'  WHEN 'nasrin.sultana@gmail.com' THEN 'O_POSITIVE'
         WHEN 'delwar.hossain@gmail.com' THEN 'A_POSITIVE'  WHEN 'laila.begum@gmail.com'    THEN 'B_POSITIVE'
       END,
       NOW(), NOW()
FROM users u
WHERE u.email IN ('rahim.uddin@gmail.com','fatema.khatun@gmail.com','mohammad.hasan@gmail.com',
                  'ruksana.akter@gmail.com','jahangir.alam@gmail.com','shahnaz.parvin@gmail.com',
                  'aminul.islam@gmail.com','nasrin.sultana@gmail.com','delwar.hossain@gmail.com','laila.begum@gmail.com')
ON CONFLICT (user_id) DO NOTHING;

-- ==================== APPOINTMENT SETTINGS ====================
INSERT INTO appointment_settings (doctor_id, auto_approve, allow_overbooking, slot_duration_minutes, buffer_time_minutes, advance_booking_days)
SELECT u.id, true, false, 30, 10, 30
FROM users u
WHERE u.email IN ('arif.rahman@healthsync.com','nadia.islam@healthsync.com','karim.hossain@healthsync.com','sumaiya.begum@healthsync.com','tanvir.ahmed@healthsync.com')
ON CONFLICT (doctor_id) DO NOTHING;

-- ==================== ADMINS ====================
-- Password: Demo@1234
INSERT INTO admins (name, email, password, phone, admin_level, status, created_at, updated_at) VALUES
('Tusher Bhomik',     'tusher@healthsync.com',  crypt('Demo@1234', gen_salt('bf', 10)), '+8801700000001', 'ROOT_ADMIN',   'ACTIVE', NOW(), NOW()),
('Sabrina Chowdhury', 'sabrina@healthsync.com', crypt('Demo@1234', gen_salt('bf', 10)), '+8801700000002', 'ADMIN',         'ACTIVE', NOW(), NOW()),
('Imtiaz Hasan',      'imtiaz@healthsync.com',  crypt('Demo@1234', gen_salt('bf', 10)), '+8801700000003', 'SUPPORT_ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ==================== APPOINTMENTS ====================
DO $$
DECLARE
  dr_arif     BIGINT; dr_nadia    BIGINT; dr_karim    BIGINT;
  dr_sumaiya  BIGINT; dr_tanvir   BIGINT;
  pt_rahim    BIGINT; pt_fatema   BIGINT; pt_hasan    BIGINT;
  pt_ruksana  BIGINT; pt_jahangir BIGINT; pt_shahnaz  BIGINT;
  pt_aminul   BIGINT; pt_nasrin   BIGINT; pt_delwar   BIGINT; pt_laila BIGINT;
  hosp1 BIGINT; hosp2 BIGINT; hosp3 BIGINT; hosp4 BIGINT; hosp5 BIGINT;
BEGIN
  SELECT id INTO dr_arif     FROM users WHERE email = 'arif.rahman@healthsync.com';
  SELECT id INTO dr_nadia    FROM users WHERE email = 'nadia.islam@healthsync.com';
  SELECT id INTO dr_karim    FROM users WHERE email = 'karim.hossain@healthsync.com';
  SELECT id INTO dr_sumaiya  FROM users WHERE email = 'sumaiya.begum@healthsync.com';
  SELECT id INTO dr_tanvir   FROM users WHERE email = 'tanvir.ahmed@healthsync.com';
  SELECT id INTO pt_rahim    FROM users WHERE email = 'rahim.uddin@gmail.com';
  SELECT id INTO pt_fatema   FROM users WHERE email = 'fatema.khatun@gmail.com';
  SELECT id INTO pt_hasan    FROM users WHERE email = 'mohammad.hasan@gmail.com';
  SELECT id INTO pt_ruksana  FROM users WHERE email = 'ruksana.akter@gmail.com';
  SELECT id INTO pt_jahangir FROM users WHERE email = 'jahangir.alam@gmail.com';
  SELECT id INTO pt_shahnaz  FROM users WHERE email = 'shahnaz.parvin@gmail.com';
  SELECT id INTO pt_aminul   FROM users WHERE email = 'aminul.islam@gmail.com';
  SELECT id INTO pt_nasrin   FROM users WHERE email = 'nasrin.sultana@gmail.com';
  SELECT id INTO pt_delwar   FROM users WHERE email = 'delwar.hossain@gmail.com';
  SELECT id INTO pt_laila    FROM users WHERE email = 'laila.begum@gmail.com';
  SELECT id INTO hosp1 FROM hospitals WHERE name = 'Dhaka Medical College Hospital';
  SELECT id INTO hosp2 FROM hospitals WHERE name = 'Square Hospital';
  SELECT id INTO hosp3 FROM hospitals WHERE name = 'United Hospital Limited';
  SELECT id INTO hosp4 FROM hospitals WHERE name = 'Chittagong Medical College Hospital';
  SELECT id INTO hosp5 FROM hospitals WHERE name = 'Apollo Hospitals Dhaka';

  -- Past COMPLETED appointments
  INSERT INTO appointments (scheduled_time, status, type, notes, doctor_user_id, patient_user_id, hospital_id, date_time, created_at, updated_at) VALUES
  (NOW() - INTERVAL '45 days', 'COMPLETED', 'IN_PERSON', 'Routine cardiac checkup. BP 130/85. ECG normal.',             dr_arif,    pt_rahim,    hosp2, (NOW()-INTERVAL'45 days')::date::text||',09:00,Sunday',    NOW()-INTERVAL'45 days', NOW()),
  (NOW() - INTERVAL '38 days', 'COMPLETED', 'IN_PERSON', 'Follow-up hypertension management.',                          dr_arif,    pt_jahangir, hosp2, (NOW()-INTERVAL'38 days')::date::text||',10:30,Sunday',   NOW()-INTERVAL'38 days', NOW()),
  (NOW() - INTERVAL '30 days', 'COMPLETED', 'VIDEO',     'Telemedicine consultation for headaches and dizziness.',      dr_nadia,   pt_fatema,   hosp1, (NOW()-INTERVAL'30 days')::date::text||',14:00,Monday',   NOW()-INTERVAL'30 days', NOW()),
  (NOW() - INTERVAL '25 days', 'COMPLETED', 'IN_PERSON', 'General fever and cough treatment.',                          dr_karim,   pt_hasan,    hosp3, (NOW()-INTERVAL'25 days')::date::text||',11:00,Saturday', NOW()-INTERVAL'25 days', NOW()),
  (NOW() - INTERVAL '20 days', 'COMPLETED', 'PHONE',     'Phone consultation for medication side effects.',             dr_nadia,   pt_aminul,   hosp1, (NOW()-INTERVAL'20 days')::date::text||',16:00,Thursday', NOW()-INTERVAL'20 days', NOW()),
  (NOW() - INTERVAL '18 days', 'COMPLETED', 'IN_PERSON', 'Pediatric checkup. Growth monitoring.',                       dr_sumaiya, pt_ruksana,  hosp5, (NOW()-INTERVAL'18 days')::date::text||',09:30,Saturday', NOW()-INTERVAL'18 days', NOW()),
  (NOW() - INTERVAL '15 days', 'COMPLETED', 'IN_PERSON', 'Skin rash assessment. Prescribed topical treatment.',         dr_tanvir,  pt_shahnaz,  hosp4, (NOW()-INTERVAL'15 days')::date::text||',15:00,Tuesday',  NOW()-INTERVAL'15 days', NOW()),
  (NOW() - INTERVAL '12 days', 'COMPLETED', 'IN_PERSON', 'Follow-up cardiac scan. Results satisfactory.',               dr_arif,    pt_delwar,   hosp2, (NOW()-INTERVAL'12 days')::date::text||',10:00,Friday',   NOW()-INTERVAL'12 days', NOW()),
  (NOW() - INTERVAL '10 days', 'COMPLETED', 'VIDEO',     'Neurological assessment for memory issues.',                  dr_nadia,   pt_nasrin,   hosp1, (NOW()-INTERVAL'10 days')::date::text||',13:00,Sunday',   NOW()-INTERVAL'10 days', NOW()),
  (NOW() - INTERVAL '7 days',  'COMPLETED', 'IN_PERSON', 'Routine checkup and blood pressure monitoring.',              dr_karim,   pt_laila,    hosp3, (NOW()-INTERVAL'7 days')::date::text||',09:00,Wednesday', NOW()-INTERVAL'7 days',  NOW()),
  -- CONFIRMED (upcoming)
  (NOW() + INTERVAL '1 day',   'CONFIRMED', 'IN_PERSON', 'Cardiology checkup for chest pain.',                          dr_arif,    pt_fatema,   hosp2, (NOW()+INTERVAL'1 day')::date::text||',09:30,Thursday',  NOW()-INTERVAL'1 day', NOW()),
  (NOW() + INTERVAL '2 days',  'CONFIRMED', 'VIDEO',     'Telemedicine follow-up for migraine.',                        dr_nadia,   pt_hasan,    hosp1, (NOW()+INTERVAL'2 days')::date::text||',14:30,Friday',   NOW()-INTERVAL'1 day', NOW()),
  (NOW() + INTERVAL '3 days',  'CONFIRMED', 'IN_PERSON', 'General checkup and lab review.',                             dr_karim,   pt_jahangir, hosp3, (NOW()+INTERVAL'3 days')::date::text||',11:00,Saturday', NOW()-INTERVAL'2 days', NOW()),
  (NOW() + INTERVAL '4 days',  'CONFIRMED', 'IN_PERSON', 'Pediatric well-child visit.',                                 dr_sumaiya, pt_shahnaz,  hosp5, (NOW()+INTERVAL'4 days')::date::text||',10:00,Sunday',   NOW()-INTERVAL'2 days', NOW()),
  (NOW() + INTERVAL '5 days',  'CONFIRMED', 'IN_PERSON', 'Skin condition follow-up.',                                   dr_tanvir,  pt_ruksana,  hosp4, (NOW()+INTERVAL'5 days')::date::text||',15:30,Monday',   NOW()-INTERVAL'1 day', NOW()),
  (NOW() - INTERVAL '2 days',  'CONFIRMED', 'IN_PERSON', 'Diabetes management consultation.',                           dr_arif,    pt_rahim,    hosp2, (NOW()-INTERVAL'2 days')::date::text||',10:00,Monday',   NOW()-INTERVAL'3 days', NOW()),
  -- REQUESTED (pending approval)
  (NOW() + INTERVAL '6 days',  'REQUESTED', 'VIDEO',     'First consultation for anxiety symptoms.',                    dr_nadia,   pt_aminul,   hosp1, (NOW()+INTERVAL'6 days')::date::text||',16:00,Tuesday',  NOW(), NOW()),
  (NOW() + INTERVAL '7 days',  'REQUESTED', 'IN_PERSON', 'Cardiac evaluation for irregular heartbeat.',                 dr_arif,    pt_nasrin,   hosp2, (NOW()+INTERVAL'7 days')::date::text||',09:00,Wednesday',NOW(), NOW()),
  (NOW() + INTERVAL '8 days',  'REQUESTED', 'PHONE',     'Follow-up medication review.',                                dr_karim,   pt_delwar,   hosp3, (NOW()+INTERVAL'8 days')::date::text||',14:00,Thursday', NOW(), NOW()),
  -- CANCELLED
  (NOW() - INTERVAL '5 days',  'CANCELLED', 'IN_PERSON', 'Patient cancelled due to travel.',                            dr_tanvir,  pt_laila,    hosp4, (NOW()-INTERVAL'5 days')::date::text||',11:00,Friday',   NOW()-INTERVAL'6 days', NOW()),
  (NOW() - INTERVAL '3 days',  'CANCELLED', 'VIDEO',     'Doctor unavailable - rescheduled.',                           dr_sumaiya, pt_rahim,    hosp5, (NOW()-INTERVAL'3 days')::date::text||',15:00,Sunday',   NOW()-INTERVAL'4 days', NOW()),
  -- SCHEDULED (future)
  (NOW() + INTERVAL '10 days', 'SCHEDULED', 'IN_PERSON', 'Annual physical examination.',                                dr_karim,   pt_fatema,   hosp3, (NOW()+INTERVAL'10 days')::date::text||',09:00,Saturday', NOW(), NOW()),
  (NOW() + INTERVAL '12 days', 'SCHEDULED', 'IN_PERSON', 'Post-operative checkup.',                                     dr_arif,    pt_hasan,    hosp2, (NOW()+INTERVAL'12 days')::date::text||',10:30,Monday',   NOW(), NOW()),
  (NOW() + INTERVAL '14 days', 'SCHEDULED', 'VIDEO',     'Neurological follow-up assessment.',                          dr_nadia,   pt_ruksana,  hosp1, (NOW()+INTERVAL'14 days')::date::text||',13:00,Wednesday',NOW(), NOW()),
  (NOW() + INTERVAL '15 days', 'SCHEDULED', 'IN_PERSON', 'Child growth and nutrition review.',                          dr_sumaiya, pt_jahangir, hosp5, (NOW()+INTERVAL'15 days')::date::text||',09:30,Thursday', NOW(), NOW());

END $$;

-- ==================== PRESCRIPTIONS ====================
DO $$
DECLARE
  dr_arif     BIGINT; dr_nadia    BIGINT; dr_karim   BIGINT;
  dr_sumaiya  BIGINT; dr_tanvir   BIGINT;
  pt_rahim    BIGINT; pt_fatema   BIGINT; pt_hasan   BIGINT;
  pt_ruksana  BIGINT; pt_jahangir BIGINT; pt_shahnaz BIGINT;
  pt_aminul   BIGINT; pt_nasrin   BIGINT; pt_delwar  BIGINT; pt_laila BIGINT;
  prx BIGINT; pm BIGINT;
  med_tab1 BIGINT; med_tab2 BIGINT; med_tab3 BIGINT;
  med_cap BIGINT; med_syr BIGINT; med_cre BIGINT; med_inh BIGINT;
BEGIN
  SELECT id INTO dr_arif     FROM users WHERE email = 'arif.rahman@healthsync.com';
  SELECT id INTO dr_nadia    FROM users WHERE email = 'nadia.islam@healthsync.com';
  SELECT id INTO dr_karim    FROM users WHERE email = 'karim.hossain@healthsync.com';
  SELECT id INTO dr_sumaiya  FROM users WHERE email = 'sumaiya.begum@healthsync.com';
  SELECT id INTO dr_tanvir   FROM users WHERE email = 'tanvir.ahmed@healthsync.com';
  SELECT id INTO pt_rahim    FROM users WHERE email = 'rahim.uddin@gmail.com';
  SELECT id INTO pt_fatema   FROM users WHERE email = 'fatema.khatun@gmail.com';
  SELECT id INTO pt_hasan    FROM users WHERE email = 'mohammad.hasan@gmail.com';
  SELECT id INTO pt_ruksana  FROM users WHERE email = 'ruksana.akter@gmail.com';
  SELECT id INTO pt_jahangir FROM users WHERE email = 'jahangir.alam@gmail.com';
  SELECT id INTO pt_shahnaz  FROM users WHERE email = 'shahnaz.parvin@gmail.com';
  SELECT id INTO pt_aminul   FROM users WHERE email = 'aminul.islam@gmail.com';
  SELECT id INTO pt_nasrin   FROM users WHERE email = 'nasrin.sultana@gmail.com';
  SELECT id INTO pt_delwar   FROM users WHERE email = 'delwar.hossain@gmail.com';
  SELECT id INTO pt_laila    FROM users WHERE email = 'laila.begum@gmail.com';

  -- Pick medicines by form (safe approach)
  SELECT id INTO med_tab1 FROM medicines WHERE form = 'TABLET' ORDER BY id LIMIT 1 OFFSET 0;
  SELECT id INTO med_tab2 FROM medicines WHERE form = 'TABLET' ORDER BY id LIMIT 1 OFFSET 5;
  SELECT id INTO med_tab3 FROM medicines WHERE form = 'TABLET' ORDER BY id LIMIT 1 OFFSET 10;
  SELECT id INTO med_cap  FROM medicines WHERE form = 'CAPSULE' ORDER BY id LIMIT 1;
  SELECT id INTO med_syr  FROM medicines WHERE form = 'SYRUP'   ORDER BY id LIMIT 1;
  SELECT id INTO med_cre  FROM medicines WHERE form = 'CREAM'   ORDER BY id LIMIT 1;
  SELECT id INTO med_inh  FROM medicines WHERE form = 'INHALER' ORDER BY id LIMIT 1;
  -- Fallbacks
  IF med_tab2 IS NULL THEN med_tab2 := med_tab1; END IF;
  IF med_tab3 IS NULL THEN med_tab3 := med_tab1; END IF;
  IF med_cap  IS NULL THEN med_cap  := med_tab1; END IF;
  IF med_syr  IS NULL THEN med_syr  := med_tab1; END IF;
  IF med_cre  IS NULL THEN med_cre  := med_tab1; END IF;
  IF med_inh  IS NULL THEN med_inh  := med_tab1; END IF;

  -- === Prescription 1: Rahim - Hypertension ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Essential Hypertension', CURRENT_DATE-45, CURRENT_DATE-15, 'Reduce salt intake, walk 30 min daily, monitor BP twice daily.', dr_arif, pt_rahim, NOW()-INTERVAL'45 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab1, 30, 'Take at the same time daily', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'MORNING', 1, '08:00', NOW(), NOW());
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab2, 30, 'Swallow whole with water', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'BEFORE_MEAL', 'NIGHT', 1, '21:00', NOW(), NOW());

  -- === Prescription 2: Fatema - Migraine ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Chronic Migraine', CURRENT_DATE-30, CURRENT_DATE+15, 'Avoid bright lights. Keep a headache diary.', dr_nadia, pt_fatema, NOW()-INTERVAL'30 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_cap, 14, 'Take at onset of migraine only', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'ANY_TIME', 'FIXED_TIME', 1, '12:00', NOW(), NOW());

  -- === Prescription 3: Hasan - Respiratory Infection ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Acute Upper Respiratory Tract Infection', CURRENT_DATE-25, CURRENT_DATE-5, 'Rest, drink warm fluids, steam inhalation twice daily.', dr_karim, pt_hasan, NOW()-INTERVAL'25 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab1, 7, 'Complete the full course', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'MORNING',   1, '08:00', NOW(), NOW()),
         (pm, 'AFTER_MEAL', 'AFTERNOON', 1, '14:00', NOW(), NOW()),
         (pm, 'AFTER_MEAL', 'NIGHT',     1, '21:00', NOW(), NOW());
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_syr, 7, 'Shake well before use', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'MORNING', 2, '08:30', NOW(), NOW()),
         (pm, 'AFTER_MEAL', 'EVENING', 2, '18:00', NOW(), NOW());

  -- === Prescription 4: Ruksana - Allergic Dermatitis ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Allergic Contact Dermatitis', CURRENT_DATE-18, CURRENT_DATE+12, 'Avoid allergens. Use fragrance-free soap.', dr_sumaiya, pt_ruksana, NOW()-INTERVAL'18 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_cre, 14, 'Apply thin layer to affected area only', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'ANY_TIME', 'MORNING', 1, '08:00', NOW(), NOW()),
         (pm, 'ANY_TIME', 'NIGHT',   1, '21:00', NOW(), NOW());

  -- === Prescription 5: Shahnaz - Urticaria ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Urticaria (Hives)', CURRENT_DATE-15, CURRENT_DATE+15, 'Avoid hot showers. Keep skin moisturized.', dr_tanvir, pt_shahnaz, NOW()-INTERVAL'15 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_cap, 10, 'May cause drowsiness. Do not drive.', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'NIGHT', 1, '21:00', NOW(), NOW());

  -- === Prescription 6: Delwar - Post-cardiac ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Ischemic Heart Disease - Post Stent', CURRENT_DATE-12, CURRENT_DATE+18, 'Light exercise only. No strenuous activity. Low-fat diet strictly.', dr_arif, pt_delwar, NOW()-INTERVAL'12 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab1, 90, 'Lifelong medication - never stop without consulting doctor', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'MORNING', 1, '08:00', NOW(), NOW());
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab3, 90, 'Take with food to avoid stomach upset', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'WITH_MEAL', 'NIGHT', 1, '21:00', NOW(), NOW());

  -- === Prescription 7: Nasrin - Anxiety ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Generalized Anxiety Disorder', CURRENT_DATE-10, CURRENT_DATE+20, 'Regular meditation and yoga. Sleep 7-8 hours.', dr_nadia, pt_nasrin, NOW()-INTERVAL'10 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_cap, 30, 'Start with lowest dose', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'MORNING', 1, '09:00', NOW(), NOW()),
         (pm, 'AFTER_MEAL', 'NIGHT',   1, '22:00', NOW(), NOW());

  -- === Prescription 8: Laila - Anemia ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Iron Deficiency Anemia', CURRENT_DATE-7, CURRENT_DATE+23, 'Increase iron-rich foods. Take with Vitamin C for better absorption.', dr_karim, pt_laila, NOW()-INTERVAL'7 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_syr, 60, 'Take on empty stomach for best absorption', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'EMPTY_STOMACH', 'MORNING', 1, '07:00', NOW(), NOW());

  -- === Prescription 9: Jahangir - Diabetes ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Type 2 Diabetes Mellitus', CURRENT_DATE-38, CURRENT_DATE+7, 'Monitor blood glucose daily. Low carb diet. 45-minute walk daily.', dr_arif, pt_jahangir, NOW()-INTERVAL'38 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab1, 90, 'Take with first bite of each meal', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'WITH_MEAL', 'MORNING',   1, '08:00', NOW(), NOW()),
         (pm, 'WITH_MEAL', 'AFTERNOON', 1, '13:00', NOW(), NOW()),
         (pm, 'WITH_MEAL', 'NIGHT',     1, '20:00', NOW(), NOW());

  -- === Prescription 10: Aminul - Tension headache ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Tension-type Headache', CURRENT_DATE-20, CURRENT_DATE+10, 'Stress management. Avoid screen time before bed.', dr_nadia, pt_aminul, NOW()-INTERVAL'20 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab2, 14, 'Take at first sign of headache', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'FIXED_TIME', 1, '12:00', NOW(), NOW());

  -- === Prescription 11: Hasan - Asthma ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Bronchial Asthma - Moderate Persistent', CURRENT_DATE-5, CURRENT_DATE+25, 'Avoid cold air and allergens. Always carry rescue inhaler.', dr_karim, pt_hasan, NOW()-INTERVAL'5 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_inh, 30, '2 puffs twice daily, shake well before use', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'ANY_TIME', 'MORNING', 2, '08:00', NOW(), NOW()),
         (pm, 'ANY_TIME', 'NIGHT',   2, '21:00', NOW(), NOW());

  -- === Prescription 12: Rahim - Dyslipidemia ===
  INSERT INTO prescriptions (diagnosis, issue_date, follow_up_date, advice, doctor_user_id, patient_user_id, created_at, updated_at)
  VALUES ('Hypertension with Dyslipidemia', CURRENT_DATE-2, CURRENT_DATE+28, 'Strict DASH diet. Moderate exercise. Avoid alcohol.', dr_arif, pt_rahim, NOW()-INTERVAL'2 days', NOW())
  RETURNING id INTO prx;
  INSERT INTO prescription_medicines (prescription_id, medicine_id, duration_days, special_instructions, created_at, updated_at)
  VALUES (prx, med_tab3, 60, 'Take at night for best effect', NOW(), NOW()) RETURNING id INTO pm;
  INSERT INTO medicine_timings (prescription_medicine_id, meal_relation, time_of_day, amount, specific_time, created_at, updated_at)
  VALUES (pm, 'AFTER_MEAL', 'NIGHT', 1, '21:00', NOW(), NOW());

END $$;

-- ==================== NOTIFICATIONS ====================
-- NotificationType enum: APPOINTMENT_CONFIRMATION, APPOINTMENT_REMINDER, APPOINTMENT_CANCELLATION,
--   PRESCRIPTION_ISSUED, PRESCRIPTION_REFILL, MEDICINE_REMINDER, SYSTEM_ALERT
DO $$
DECLARE
  dr_arif BIGINT; dr_nadia BIGINT; dr_karim BIGINT; dr_sumaiya BIGINT;
  pt_rahim BIGINT; pt_fatema BIGINT; pt_hasan BIGINT;
  pt_jahangir BIGINT; pt_nasrin BIGINT; pt_delwar BIGINT; pt_shahnaz BIGINT;
BEGIN
  SELECT id INTO dr_arif     FROM users WHERE email = 'arif.rahman@healthsync.com';
  SELECT id INTO dr_nadia    FROM users WHERE email = 'nadia.islam@healthsync.com';
  SELECT id INTO dr_karim    FROM users WHERE email = 'karim.hossain@healthsync.com';
  SELECT id INTO dr_sumaiya  FROM users WHERE email = 'sumaiya.begum@healthsync.com';
  SELECT id INTO pt_rahim    FROM users WHERE email = 'rahim.uddin@gmail.com';
  SELECT id INTO pt_fatema   FROM users WHERE email = 'fatema.khatun@gmail.com';
  SELECT id INTO pt_hasan    FROM users WHERE email = 'mohammad.hasan@gmail.com';
  SELECT id INTO pt_jahangir FROM users WHERE email = 'jahangir.alam@gmail.com';
  SELECT id INTO pt_nasrin   FROM users WHERE email = 'nasrin.sultana@gmail.com';
  SELECT id INTO pt_delwar   FROM users WHERE email = 'delwar.hossain@gmail.com';
  SELECT id INTO pt_shahnaz  FROM users WHERE email = 'shahnaz.parvin@gmail.com';

  INSERT INTO notifications (id, user_id, title, message, type, "isread", created_at) VALUES
  (gen_random_uuid(), pt_rahim,    'Appointment Confirmed',     'Your appointment with Dr. Arif Rahman on April 11 at 09:30 AM is confirmed.',          'APPOINTMENT_CONFIRMATION', false, NOW()-INTERVAL'1 day'),
  (gen_random_uuid(), pt_rahim,    'New Prescription Issued',   'Dr. Arif Rahman has issued a new prescription for Hypertension with Dyslipidemia.',     'PRESCRIPTION_ISSUED',      false, NOW()-INTERVAL'2 days'),
  (gen_random_uuid(), pt_fatema,   'Appointment Reminder',      'Reminder: You have an appointment with Dr. Arif Rahman tomorrow at 09:30 AM.',           'APPOINTMENT_REMINDER',     false, NOW()-INTERVAL'12 hours'),
  (gen_random_uuid(), pt_hasan,    'Prescription Issued',       'Your prescription for Bronchial Asthma has been issued by Dr. Karim Hossain.',           'PRESCRIPTION_ISSUED',      true,  NOW()-INTERVAL'5 days'),
  (gen_random_uuid(), pt_jahangir, 'Follow-up Reminder',        'Your follow-up with Dr. Arif Rahman is due in 7 days. Please book your appointment.',    'APPOINTMENT_REMINDER',     false, NOW()-INTERVAL'3 days'),
  (gen_random_uuid(), pt_nasrin,   'Appointment Request Sent',  'Your appointment request with Dr. Arif Rahman on April 17 is pending confirmation.',     'APPOINTMENT_CONFIRMATION', false, NOW()),
  (gen_random_uuid(), pt_delwar,   'Lab Results Available',     'Your cardiac lab results are ready. Please discuss with your doctor at your next visit.', 'SYSTEM_ALERT',             true,  NOW()-INTERVAL'8 days'),
  (gen_random_uuid(), pt_shahnaz,  'Medicine Reminder',         'Time to take your evening dose of antihistamine. Take after meals.',                      'MEDICINE_REMINDER',        false, NOW()-INTERVAL'2 hours'),
  (gen_random_uuid(), dr_arif,     'New Appointment Request',   'Patient Nasrin Sultana has requested an appointment on April 17 at 09:00 AM.',            'APPOINTMENT_CONFIRMATION', false, NOW()),
  (gen_random_uuid(), dr_arif,     'Prescription Acknowledged', 'Patient Rahim Uddin has acknowledged your latest prescription.',                          'PRESCRIPTION_ISSUED',      true,  NOW()-INTERVAL'1 day'),
  (gen_random_uuid(), dr_nadia,    'New Appointment Request',   'Patient Aminul Islam has requested a video consultation on April 16.',                    'APPOINTMENT_CONFIRMATION', false, NOW()),
  (gen_random_uuid(), dr_karim,    'Schedule Reminder',         'You have 3 confirmed appointments tomorrow. Please review your schedule.',                 'SYSTEM_ALERT',             false, NOW()-INTERVAL'6 hours'),
  (gen_random_uuid(), dr_sumaiya,  'New Patient Registered',    'New patient Shahnaz Parvin has registered and booked a pediatric appointment.',           'SYSTEM_ALERT',             true,  NOW()-INTERVAL'2 days');

END $$;

-- ==================== DOCTOR HOSPITAL SCHEDULES ====================
DO $$
DECLARE
  dr_arif BIGINT; dr_nadia BIGINT; dr_karim BIGINT; dr_sumaiya BIGINT; dr_tanvir BIGINT;
  hosp1 BIGINT; hosp2 BIGINT; hosp3 BIGINT; hosp4 BIGINT; hosp5 BIGINT;
BEGIN
  SELECT id INTO dr_arif    FROM users WHERE email = 'arif.rahman@healthsync.com';
  SELECT id INTO dr_nadia   FROM users WHERE email = 'nadia.islam@healthsync.com';
  SELECT id INTO dr_karim   FROM users WHERE email = 'karim.hossain@healthsync.com';
  SELECT id INTO dr_sumaiya FROM users WHERE email = 'sumaiya.begum@healthsync.com';
  SELECT id INTO dr_tanvir  FROM users WHERE email = 'tanvir.ahmed@healthsync.com';
  SELECT id INTO hosp1 FROM hospitals WHERE name = 'Dhaka Medical College Hospital';
  SELECT id INTO hosp2 FROM hospitals WHERE name = 'Square Hospital';
  SELECT id INTO hosp3 FROM hospitals WHERE name = 'United Hospital Limited';
  SELECT id INTO hosp4 FROM hospitals WHERE name = 'Chittagong Medical College Hospital';
  SELECT id INTO hosp5 FROM hospitals WHERE name = 'Apollo Hospitals Dhaka';

  INSERT INTO doctor_hospital_schedules (doctor_id, hospital_id, day_of_week, time_slots) VALUES
  (dr_arif,    hosp2, 'SUNDAY',    '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30'),
  (dr_arif,    hosp2, 'MONDAY',    '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30'),
  (dr_arif,    hosp2, 'TUESDAY',   '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30'),
  (dr_nadia,   hosp1, 'SUNDAY',    '14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30'),
  (dr_nadia,   hosp1, 'WEDNESDAY', '14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30'),
  (dr_nadia,   hosp1, 'THURSDAY',  '14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30'),
  (dr_karim,   hosp3, 'MONDAY',    '10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30,15:00,15:30'),
  (dr_karim,   hosp3, 'WEDNESDAY', '10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30,15:00,15:30'),
  (dr_karim,   hosp3, 'SATURDAY',  '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30'),
  (dr_sumaiya, hosp5, 'SUNDAY',    '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30'),
  (dr_sumaiya, hosp5, 'TUESDAY',   '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30'),
  (dr_tanvir,  hosp4, 'MONDAY',    '15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30'),
  (dr_tanvir,  hosp4, 'THURSDAY',  '15:00,15:30,16:00,16:30,17:00,17:30,18:00,18:30'),
  (dr_tanvir,  hosp4, 'SATURDAY',  '10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30');

END $$;

-- ==================== VERIFY ====================
SELECT 'SEED COMPLETE' as status;
SELECT COUNT(*) as hospitals  FROM hospitals;
SELECT COUNT(*) as users       FROM users;
SELECT COUNT(*) as doctors     FROM doctors;
SELECT COUNT(*) as patients    FROM patients;
SELECT COUNT(*) as admins      FROM admins;
SELECT COUNT(*) as appointments FROM appointments;
SELECT COUNT(*) as prescriptions FROM prescriptions;
SELECT COUNT(*) as notifications FROM notifications;
