--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.2

-- Started on 2025-06-19 10:43:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS neondb;
--
-- TOC entry 3441 (class 1262 OID 16389)
-- Name: neondb; Type: DATABASE; Schema: -; Owner: neondb_owner
--

CREATE DATABASE neondb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = builtin LOCALE = 'C.UTF-8' BUILTIN_LOCALE = 'C.UTF-8';


ALTER DATABASE neondb OWNER TO neondb_owner;

\connect neondb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 237859)
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    followup_date timestamp(6) without time zone,
    notes text,
    scheduled_time timestamp(6) without time zone NOT NULL,
    status character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    doctor_user_id bigint NOT NULL,
    patient_user_id bigint NOT NULL,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'CONFIRMED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT appointments_type_check CHECK (((type)::text = ANY ((ARRAY['IN_PERSON'::character varying, 'VIDEO'::character varying, 'PHONE'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO neondb_owner;

--
-- TOC entry 217 (class 1259 OID 237858)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3443 (class 0 OID 0)
-- Dependencies: 217
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- TOC entry 219 (class 1259 OID 237869)
-- Name: doctors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.doctors (
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    institute character varying(255) NOT NULL,
    license_number character varying(255) NOT NULL,
    specialization character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.doctors OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 237877)
-- Name: medicine_generics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medicine_generics (
    id bigint NOT NULL,
    category character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description json,
    generic_name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.medicine_generics OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 237876)
-- Name: medicine_generics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.medicine_generics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_generics_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3444 (class 0 OID 0)
-- Dependencies: 220
-- Name: medicine_generics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.medicine_generics_id_seq OWNED BY public.medicine_generics.id;


--
-- TOC entry 223 (class 1259 OID 237886)
-- Name: medicine_timings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medicine_timings (
    id bigint NOT NULL,
    amount numeric(38,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    interval_hours integer,
    meal_relation character varying(255) NOT NULL,
    specific_time time(6) without time zone,
    time_of_day character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    prescription_medicine_id bigint NOT NULL,
    CONSTRAINT medicine_timings_meal_relation_check CHECK (((meal_relation)::text = ANY ((ARRAY['BEFORE_MEAL'::character varying, 'AFTER_MEAL'::character varying, 'WITH_MEAL'::character varying, 'EMPTY_STOMACH'::character varying, 'ANY_TIME'::character varying])::text[]))),
    CONSTRAINT medicine_timings_time_of_day_check CHECK (((time_of_day)::text = ANY ((ARRAY['MORNING'::character varying, 'AFTERNOON'::character varying, 'EVENING'::character varying, 'NIGHT'::character varying, 'BEDTIME'::character varying, 'FIXED_TIME'::character varying, 'INTERVAL'::character varying])::text[])))
);


ALTER TABLE public.medicine_timings OWNER TO neondb_owner;

--
-- TOC entry 222 (class 1259 OID 237885)
-- Name: medicine_timings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.medicine_timings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_timings_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3445 (class 0 OID 0)
-- Dependencies: 222
-- Name: medicine_timings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.medicine_timings_id_seq OWNED BY public.medicine_timings.id;


--
-- TOC entry 225 (class 1259 OID 237897)
-- Name: medicines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medicines (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    form character varying(255) NOT NULL,
    manufacturer character varying(255),
    name character varying(255) NOT NULL,
    price numeric(38,2) NOT NULL,
    strength character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    generic_id bigint NOT NULL,
    CONSTRAINT medicines_form_check CHECK (((form)::text = ANY ((ARRAY['TABLET'::character varying, 'CAPSULE'::character varying, 'SYRUP'::character varying, 'INJECTION'::character varying, 'CREAM'::character varying, 'DROPS'::character varying, 'INHALER'::character varying, 'PATCH'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE public.medicines OWNER TO neondb_owner;

--
-- TOC entry 224 (class 1259 OID 237896)
-- Name: medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.medicines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3446 (class 0 OID 0)
-- Dependencies: 224
-- Name: medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.medicines_id_seq OWNED BY public.medicines.id;


--
-- TOC entry 226 (class 1259 OID 237906)
-- Name: patients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patients (
    user_id bigint NOT NULL,
    blood_type character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    height_cm numeric(38,2),
    updated_at timestamp(6) without time zone NOT NULL,
    weight_kg numeric(38,2),
    CONSTRAINT patients_blood_type_check CHECK (((blood_type)::text = ANY ((ARRAY['A_POSITIVE'::character varying, 'A_NEGATIVE'::character varying, 'B_POSITIVE'::character varying, 'B_NEGATIVE'::character varying, 'AB_POSITIVE'::character varying, 'AB_NEGATIVE'::character varying, 'O_POSITIVE'::character varying, 'O_NEGATIVE'::character varying, 'UNKNOWN'::character varying])::text[])))
);


ALTER TABLE public.patients OWNER TO neondb_owner;

--
-- TOC entry 228 (class 1259 OID 237913)
-- Name: prescription_medicines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prescription_medicines (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    duration_days integer NOT NULL,
    special_instructions text,
    updated_at timestamp(6) without time zone NOT NULL,
    medicine_id bigint NOT NULL,
    prescription_id bigint NOT NULL
);


ALTER TABLE public.prescription_medicines OWNER TO neondb_owner;

--
-- TOC entry 227 (class 1259 OID 237912)
-- Name: prescription_medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.prescription_medicines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_medicines_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3447 (class 0 OID 0)
-- Dependencies: 227
-- Name: prescription_medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.prescription_medicines_id_seq OWNED BY public.prescription_medicines.id;


--
-- TOC entry 230 (class 1259 OID 237922)
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prescriptions (
    id bigint NOT NULL,
    advice text,
    created_at timestamp(6) without time zone NOT NULL,
    diagnosis text NOT NULL,
    follow_up_date date,
    issue_date date NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    appointment_id bigint,
    doctor_user_id bigint NOT NULL,
    patient_user_id bigint NOT NULL
);


ALTER TABLE public.prescriptions OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 237921)
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.prescriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3448 (class 0 OID 0)
-- Dependencies: 229
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- TOC entry 232 (class 1259 OID 237931)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    birth_date date NOT NULL,
    created_at timestamp(6) without time zone,
    email character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    is_verified boolean NOT NULL,
    last_login timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(255),
    profile_image character varying(255),
    role character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    CONSTRAINT users_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['DOCTOR'::character varying, 'PATIENT'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 237930)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3449 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3225 (class 2604 OID 237862)
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- TOC entry 3226 (class 2604 OID 237880)
-- Name: medicine_generics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicine_generics ALTER COLUMN id SET DEFAULT nextval('public.medicine_generics_id_seq'::regclass);


--
-- TOC entry 3227 (class 2604 OID 237889)
-- Name: medicine_timings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicine_timings ALTER COLUMN id SET DEFAULT nextval('public.medicine_timings_id_seq'::regclass);


--
-- TOC entry 3228 (class 2604 OID 237900)
-- Name: medicines id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicines ALTER COLUMN id SET DEFAULT nextval('public.medicines_id_seq'::regclass);


--
-- TOC entry 3229 (class 2604 OID 237916)
-- Name: prescription_medicines id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_medicines ALTER COLUMN id SET DEFAULT nextval('public.prescription_medicines_id_seq'::regclass);


--
-- TOC entry 3230 (class 2604 OID 237925)
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- TOC entry 3231 (class 2604 OID 237934)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3421 (class 0 OID 237859)
-- Dependencies: 218
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, created_at, followup_date, notes, scheduled_time, status, type, updated_at, doctor_user_id, patient_user_id) FROM stdin;
3	2025-05-27 07:13:10.326693	2025-06-15 10:00:00	First visit – throat pain	2025-06-01 10:00:00	SCHEDULED	IN_PERSON	2025-05-27 07:13:10.326693	1	2
4	2025-05-27 07:13:10.326693	\N	Follow-up for diabetes control	2025-06-02 15:30:00	SCHEDULED	VIDEO	2025-05-27 07:13:10.326693	1	2
14	2025-06-15 18:39:30.26473	2025-06-17 09:30:00	 FF	2025-06-17 09:30:00	SCHEDULED	IN_PERSON	2025-06-15 18:39:30.26473	5	20
15	2025-06-15 18:45:47.800565	2025-06-17 09:30:00	 FF	2025-06-17 09:30:00	SCHEDULED	IN_PERSON	2025-06-15 18:45:47.800565	5	20
16	2025-06-15 19:23:01.037205	2025-06-26 10:00:00	fdsxg	2025-06-26 10:00:00	SCHEDULED	VIDEO	2025-06-15 19:23:01.037205	5	20
17	2025-06-15 19:23:21.579796	2025-06-27 10:30:00	sdfg	2025-06-27 10:30:00	SCHEDULED	VIDEO	2025-06-15 19:23:21.579796	16	20
18	2025-06-15 19:24:14.887394	2025-06-20 10:30:00	sdfsdf	2025-06-20 10:30:00	SCHEDULED	PHONE	2025-06-15 19:24:14.887394	5	20
19	2025-06-15 19:25:33.774623	2025-06-21 11:00:00	sdf	2025-06-21 11:00:00	SCHEDULED	VIDEO	2025-06-15 19:25:33.774623	5	20
20	2025-06-16 11:57:53.748996	2025-06-21 10:30:00	sdffsfd	2025-06-21 10:30:00	SCHEDULED	IN_PERSON	2025-06-16 11:57:53.748996	3	20
21	2025-06-16 11:58:09.513769	2025-06-22 10:30:00	goku	2025-06-22 10:30:00	SCHEDULED	VIDEO	2025-06-16 11:58:09.513769	3	20
22	2025-06-16 14:51:35.84211	2025-06-18 15:30:00	hj	2025-06-18 15:30:00	SCHEDULED	IN_PERSON	2025-06-16 14:51:35.84211	5	20
\.


--
-- TOC entry 3422 (class 0 OID 237869)
-- Dependencies: 219
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.doctors (user_id, created_at, institute, license_number, specialization, updated_at) FROM stdin;
\.


--
-- TOC entry 3424 (class 0 OID 237877)
-- Dependencies: 221
-- Data for Name: medicine_generics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medicine_generics (id, category, created_at, description, generic_name, updated_at) FROM stdin;
1	Analgesic / Antipyretic	2025-05-27 06:51:41.685328	{"indication":"Fever, mild to moderate pain",\n     "contraindications":["Severe hepatic impairment"],\n     "sideEffects":["Nausea","Rash"],\n     "adultDose":"500-1000 mg every 4–6 h"}	Paracetamol	2025-05-27 06:51:41.685328
2	Macrolide Antibiotic	2025-05-27 06:51:41.685328	{"indication":"Bacterial infections (RTI, STI)",\n     "contraindications":["Hypersensitivity to macrolides"],\n     "sideEffects":["GI upset","QT prolongation"],\n     "adultDose":"500 mg day 1, then 250 mg ×4 days"}	Azithromycin	2025-05-27 06:51:41.685328
3	NSAID	2025-05-27 06:51:41.685328	{"indication":"Pain, inflammation, dysmenorrhoea",\n     "contraindications":["Peptic ulcer","Severe HF"],\n     "sideEffects":["Dyspepsia","Renal impairment"],\n     "adultDose":"200-400 mg every 6-8 h"}	Ibuprofen	2025-05-27 06:51:41.685328
4	Proton-Pump Inhibitor	2025-05-27 06:51:41.685328	{"indication":"GERD, peptic ulcer, H. pylori regimen",\n     "contraindications":["Hypersensitivity"],\n     "sideEffects":["Headache","Vitamin B₁₂ deficiency"],\n     "adultDose":"20-40 mg once daily"}	Omeprazole	2025-05-27 06:51:41.685328
5	Antidiabetic (Biguanide)	2025-05-27 06:51:41.685328	{"indication":"Type 2 diabetes mellitus",\n     "contraindications":["eGFR <30 mL/min","Lactic acidosis"],\n     "sideEffects":["GI upset","Lactic acidosis (rare)"],\n     "adultDose":"500-1000 mg twice daily"}	Metformin	2025-05-27 06:51:41.685328
\.


--
-- TOC entry 3426 (class 0 OID 237886)
-- Dependencies: 223
-- Data for Name: medicine_timings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medicine_timings (id, amount, created_at, interval_hours, meal_relation, specific_time, time_of_day, updated_at, prescription_medicine_id) FROM stdin;
1	1.00	2025-05-27 13:43:42.404549	\N	AFTER_MEAL	08:00:00	MORNING	2025-05-27 13:43:42.404549	7
2	1.00	2025-05-27 13:43:42.404549	\N	AFTER_MEAL	20:00:00	NIGHT	2025-05-27 13:43:42.404549	7
3	1.00	2025-05-27 13:43:42.404549	\N	BEFORE_MEAL	07:00:00	MORNING	2025-05-27 13:43:42.404549	8
4	1.00	2025-05-27 14:27:30.532634	\N	AFTER_MEAL	\N	MORNING	2025-05-27 14:27:30.532634	9
5	1.00	2025-05-27 14:27:30.532634	\N	AFTER_MEAL	\N	NIGHT	2025-05-27 14:27:30.532634	9
6	1.00	2025-05-27 21:22:42.593835	\N	AFTER_MEAL	\N	MORNING	2025-05-27 21:22:42.593835	10
7	1.00	2025-05-27 21:22:42.593835	\N	AFTER_MEAL	\N	NIGHT	2025-05-27 21:22:42.593835	10
8	1.00	2025-05-27 22:50:18.516201	\N	AFTER_MEAL	\N	MORNING	2025-05-27 22:50:18.516201	11
9	1.00	2025-05-27 22:50:18.516201	\N	AFTER_MEAL	\N	NIGHT	2025-05-27 22:50:18.516201	11
10	1.00	2025-05-28 11:21:01.006928	\N	WITH_MEAL	08:00:00	MORNING	2025-05-28 11:21:01.006928	12
11	1.00	2025-05-28 11:21:01.006928	\N	WITH_MEAL	14:00:00	AFTERNOON	2025-05-28 11:21:01.006928	12
12	1.00	2025-05-28 11:21:01.006928	\N	WITH_MEAL	20:00:00	NIGHT	2025-05-28 11:21:01.006928	12
13	1.00	2025-05-28 11:23:02.527277	\N	AFTER_MEAL	20:00:00	NIGHT	2025-05-28 11:23:02.527277	13
14	1.00	2025-05-28 11:26:00.709397	\N	AFTER_MEAL	08:00:00	MORNING	2025-05-28 11:26:00.709397	14
15	1.00	2025-05-28 11:26:00.709397	\N	AFTER_MEAL	14:00:00	AFTERNOON	2025-05-28 11:26:00.709397	14
16	1.00	2025-05-28 11:26:00.709397	\N	AFTER_MEAL	20:00:00	NIGHT	2025-05-28 11:26:00.709397	14
17	1.00	2025-05-28 11:28:02.064151	\N	AFTER_MEAL	\N	MORNING	2025-05-28 11:28:02.064151	15
18	1.00	2025-05-28 11:28:02.064151	\N	AFTER_MEAL	\N	NIGHT	2025-05-28 11:28:02.064151	15
19	1.00	2025-05-28 11:34:37.422581	\N	AFTER_MEAL	08:00:00	MORNING	2025-05-28 11:34:37.422581	16
20	1.00	2025-05-28 11:34:37.422581	\N	AFTER_MEAL	14:00:00	AFTERNOON	2025-05-28 11:34:37.422581	16
21	1.00	2025-05-28 11:34:37.422581	\N	AFTER_MEAL	20:00:00	NIGHT	2025-05-28 11:34:37.422581	16
22	1.00	2025-06-12 11:50:50.278857	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-12 11:50:50.278857	17
23	1.00	2025-06-12 11:50:50.278857	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-12 11:50:50.278857	17
24	1.00	2025-06-12 11:50:50.859172	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-12 11:50:50.859172	18
25	1.00	2025-06-12 11:50:50.997266	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-12 11:50:50.997266	19
26	1.00	2025-06-12 11:50:50.859172	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-12 11:50:50.859172	18
27	1.00	2025-06-12 11:50:50.997266	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-12 11:50:50.997266	19
28	1.00	2025-06-12 12:22:01.448094	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-12 12:22:01.448094	20
29	1.00	2025-06-12 12:23:12.841611	\N	BEFORE_MEAL	08:00:00	MORNING	2025-06-12 12:23:12.841611	21
30	1.00	2025-06-12 12:35:54.621505	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-12 12:35:54.621505	22
31	1.00	2025-06-12 12:38:46.360382	\N	WITH_MEAL	20:00:00	NIGHT	2025-06-12 12:38:46.360382	23
32	1.00	2025-06-12 12:43:21.143059	\N	WITH_MEAL	08:00:00	MORNING	2025-06-12 12:43:21.143059	24
33	1.00	2025-06-12 12:43:21.143059	\N	WITH_MEAL	14:00:00	AFTERNOON	2025-06-12 12:43:21.143059	24
34	1.00	2025-06-12 12:43:21.143059	\N	WITH_MEAL	20:00:00	NIGHT	2025-06-12 12:43:21.143059	24
35	1.00	2025-06-12 12:48:19.100812	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-12 12:48:19.100812	25
36	1.00	2025-06-12 12:48:19.100812	\N	AFTER_MEAL	14:00:00	AFTERNOON	2025-06-12 12:48:19.100812	25
37	1.00	2025-06-12 12:48:19.100812	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-12 12:48:19.100812	25
38	1.00	2025-06-15 16:21:55.501086	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-15 16:21:55.501086	26
39	1.00	2025-06-15 16:21:55.501086	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-15 16:21:55.501086	26
40	1.00	2025-06-15 16:21:55.501086	\N	AFTER_MEAL	08:00:00	MORNING	2025-06-15 16:21:55.501086	27
41	1.00	2025-06-15 16:21:55.501086	\N	AFTER_MEAL	14:00:00	AFTERNOON	2025-06-15 16:21:55.501086	27
42	1.00	2025-06-15 16:21:55.501086	\N	AFTER_MEAL	20:00:00	NIGHT	2025-06-15 16:21:55.501086	27
\.


--
-- TOC entry 3428 (class 0 OID 237897)
-- Dependencies: 225
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medicines (id, created_at, form, manufacturer, name, price, strength, updated_at, generic_id) FROM stdin;
1	2025-05-27 06:51:41.999258	TABLET	Square Pharma	AcePlus	1.50	500 mg	2025-05-27 06:51:41.999258	1
2	2025-05-27 06:51:41.999258	SYRUP	Beximco Pharma	ParaFast Suspension	2.10	250 mg/5 mL	2025-05-27 06:51:41.999258	1
3	2025-05-27 06:51:41.999258	TABLET	Incepta Pharma	Azicure	0.90	500 mg	2025-05-27 06:51:41.999258	2
4	2025-05-27 06:51:41.999258	SYRUP	Opsonin Pharma	AziKid	1.25	200 mg/5 mL	2025-05-27 06:51:41.999258	2
5	2025-05-27 06:51:41.999258	TABLET	Renata Limited	IbuSafe	0.75	400 mg	2025-05-27 06:51:41.999258	3
6	2025-05-27 06:51:41.999258	CREAM	ACME Labs	IbuGel	3.40	5 %	2025-05-27 06:51:41.999258	3
7	2025-05-27 06:51:41.999258	DROPS	Drug Intl	IbuDrop	1.10	100 mg/mL	2025-05-27 06:51:41.999258	3
8	2025-05-27 06:51:41.999258	CAPSULE	Eskayef Pharma	Omezol	0.60	20 mg	2025-05-27 06:51:41.999258	4
9	2025-05-27 06:51:41.999258	INJECTION	Healthcare Ph	Omepra IV	4.20	40 mg	2025-05-27 06:51:41.999258	4
10	2025-05-27 06:51:41.999258	TABLET	Aristopharma	Metfor XR	0.55	500 mg	2025-05-27 06:51:41.999258	5
11	2025-05-27 06:51:41.999258	TABLET	ACI Limited	GluFormin	0.70	850 mg	2025-05-27 06:51:41.999258	5
12	2025-05-27 06:51:41.999258	PATCH	BCS Pharma	MetfoPatch	2.80	50 mg/h	2025-05-27 06:51:41.999258	5
\.


--
-- TOC entry 3429 (class 0 OID 237906)
-- Dependencies: 226
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patients (user_id, blood_type, created_at, height_cm, updated_at, weight_kg) FROM stdin;
\.


--
-- TOC entry 3431 (class 0 OID 237913)
-- Dependencies: 228
-- Data for Name: prescription_medicines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prescription_medicines (id, created_at, duration_days, special_instructions, updated_at, medicine_id, prescription_id) FROM stdin;
7	2025-05-27 13:43:42.404549	5	Take with water	2025-05-27 13:43:42.404549	1	12
8	2025-05-27 13:43:42.404549	3	On empty stomach	2025-05-27 13:43:42.404549	4	12
9	2025-05-27 14:27:30.532634	5	Take after meals	2025-05-27 14:27:30.532634	1	13
10	2025-05-27 21:22:42.593835	5	Take after meals	2025-05-27 21:22:42.593835	1	14
11	2025-05-27 22:50:18.516201	5	Take after meals	2025-05-27 22:50:18.516201	1	15
12	2025-05-28 11:21:01.006928	7	GG	2025-05-28 11:21:01.006928	5	16
13	2025-05-28 11:23:02.527277	7	none	2025-05-28 11:23:02.527277	5	17
14	2025-05-28 11:26:00.709397	7	gg	2025-05-28 11:26:00.709397	5	18
15	2025-05-28 11:28:02.064151	5	Take after meals	2025-05-28 11:28:02.064151	1	19
16	2025-05-28 11:34:37.422581	7	HHHH	2025-05-28 11:34:37.422581	5	20
17	2025-06-12 11:50:50.278857	7	sdfdfsdfs	2025-06-12 11:50:50.278857	4	21
18	2025-06-12 11:50:50.859172	7	sdfdfsdfs	2025-06-12 11:50:50.859172	4	22
19	2025-06-12 11:50:50.997266	7	sdfdfsdfs	2025-06-12 11:50:50.997266	4	23
20	2025-06-12 12:22:01.448094	7	i am vengence	2025-06-12 12:22:01.448094	1	24
21	2025-06-12 12:23:12.841611	7	in blackest night	2025-06-12 12:23:12.841611	2	25
22	2025-06-12 12:35:54.621505	7	vegeta	2025-06-12 12:35:54.621505	2	26
23	2025-06-12 12:38:46.360382	7	sdfdfsdfs	2025-06-12 12:38:46.360382	1	27
24	2025-06-12 12:43:21.143059	7	final flash	2025-06-12 12:43:21.143059	1	28
25	2025-06-12 12:48:19.100812	7	zorro	2025-06-12 12:48:19.100812	1	29
26	2025-06-15 16:21:55.501086	7	hmmm hmmm hmmm	2025-06-15 16:21:55.501086	2	30
27	2025-06-15 16:21:55.501086	7	doridoridoridoridoridoridoridori	2025-06-15 16:21:55.501086	1	30
\.


--
-- TOC entry 3433 (class 0 OID 237922)
-- Dependencies: 230
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prescriptions (id, advice, created_at, diagnosis, follow_up_date, issue_date, updated_at, appointment_id, doctor_user_id, patient_user_id) FROM stdin;
12	\N	2025-05-27 13:43:42.404549	Acute pharyngitis	2025-06-05	2025-05-27	2025-05-27 13:43:42.404549	\N	1	2
13	\N	2025-05-27 14:27:30.532634	Flu with mild fever	2025-06-01	2025-05-27	2025-05-27 14:27:30.532634	\N	3	2
14	\N	2025-05-27 21:22:42.593835	Flu with mild fever	2025-06-01	2025-05-27	2025-05-27 21:22:42.593835	\N	3	2
15	\N	2025-05-27 22:50:18.516201	Flu with mild fever	2025-06-01	2025-05-27	2025-05-27 22:50:18.516201	\N	3	2
16	\N	2025-05-28 11:21:01.006928	fever	2025-05-29	2025-05-28	2025-05-28 11:21:01.006928	\N	3	18
17	\N	2025-05-28 11:23:02.527277	Fever	2025-05-29	2025-05-28	2025-05-28 11:23:02.527277	\N	3	2
18	\N	2025-05-28 11:26:00.709397	Fever	2025-05-30	2025-05-28	2025-05-28 11:26:00.709397	\N	3	15
19	\N	2025-05-28 11:28:02.064151	Flu with mild fever	2025-06-01	2025-05-28	2025-05-28 11:28:02.064151	\N	3	2
20	\N	2025-05-28 11:34:37.422581	hi	2025-05-30	2025-05-28	2025-05-28 11:34:37.422581	\N	3	13
21	\N	2025-06-12 11:50:50.278857	batman	\N	2025-06-12	2025-06-12 11:50:50.278857	\N	3	2
22	\N	2025-06-12 11:50:50.859172	batman	\N	2025-06-12	2025-06-12 11:50:50.859172	\N	3	2
23	\N	2025-06-12 11:50:50.997266	batman	\N	2025-06-12	2025-06-12 11:50:50.997266	\N	3	2
24	\N	2025-06-12 12:22:01.448094	i am batman	2025-06-17	2025-06-12	2025-06-12 12:22:01.448094	\N	3	20
25	\N	2025-06-12 12:23:12.841611	in brightest day	2025-06-16	2025-06-12	2025-06-12 12:23:12.841611	\N	3	20
26	\N	2025-06-12 12:35:54.621505	goku	2025-06-19	2025-06-12	2025-06-12 12:35:54.621505	\N	3	20
27	\N	2025-06-12 12:38:46.360382	migu	2025-06-18	2025-06-12	2025-06-12 12:38:46.360382	\N	3	20
28	\N	2025-06-12 12:43:21.143059	kamehameha	2025-06-18	2025-06-12	2025-06-12 12:43:21.143059	\N	3	20
29	sanji	2025-06-12 12:48:19.100812	luffy	2025-07-01	2025-06-12	2025-06-12 12:48:19.100812	\N	3	20
30	\N	2025-06-15 16:21:55.501086	Nyanjaja	2025-06-16	2025-06-15	2025-06-15 16:21:55.501086	\N	3	20
\.


--
-- TOC entry 3435 (class 0 OID 237931)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, birth_date, created_at, email, gender, is_verified, last_login, name, password_hash, phone, profile_image, role, updated_at) FROM stdin;
5	2025-04-30	\N	avik@example.com	MALE	f	2025-05-27 21:48:37.874571	Avik	$2a$10$kU7g11x66X8/LVz4hagnMOycqiu.EwOI0QMr9trEhEhUNiNvdE6t2	123456789	\N	DOCTOR	\N
2	1985-02-20	\N	patient1@example.com	FEMALE	f	\N	Jane Doe	$2a$10$qGUqJSBUpAZOPKWJsV3C9On8dujqBSMVDHex204qk7Um0CuxhPQXy	+8801712345678	\N	PATIENT	\N
16	2025-05-01	\N	doctor12@examole.com	MALE	f	\N	Doctor12	$2a$10$bszBPqoXpAqH8k4Lbzujcu3jgSxkhgNGlNliP.CC0y7jrw0Es5mrS	doctor51@example.com	\N	DOCTOR	\N
20	2025-01-01	\N	experience@gmail.com	MALE	f	2025-06-18 15:01:02.617507	bat man	$2a$10$zNFtT.HpHb1N9Kbj5Oy07ejA3YDPu/4V37Slzrw.cfR1wWngxuHC.	11234567890	\N	PATIENT	\N
3	1980-05-15	\N	doctor51@example.com	MALE	f	2025-06-18 15:04:08.931239	Dr. Avinav	$2a$10$SmOqpYGND2I/0De.87GJ5e.Cjakmmks6ZZQW9SaWUxJVTYYaHJp1W	1234567890	\N	DOCTOR	\N
13	1990-01-15	\N	testpatient@example.com	MALE	f	\N	Test Patient	$2a$10$QyVzWxdVO5xeXt/DH5WiZ.nKzvlSLlJeN9a5xGQ3tglJ.gHD7JXX.	1234567890	\N	PATIENT	\N
18	1990-01-15	\N	testpatient81@example.com	MALE	f	2025-06-15 16:10:21.658402	Test Patient	$2a$10$5fTzA9Vx66pnl/.iWBjjU.XdXPMQgMwFA8Y80vIiQaOxgmqZrjOwe	1234567890	\N	PATIENT	\N
1	1985-02-20	\N	jane.doe@example.com	FEMALE	f	2025-05-28 00:56:02.789029	Dr. Jane Doe	$2a$10$JJnexifCmTLKrCJgiQ4tNexuXwpFEaUvODdnYOH153e6zRXKBenyy	+8801712345678	\N	DOCTOR	\N
15	1990-01-15	\N	testpatient1@example.com	MALE	f	2025-05-28 11:26:26.017117	Test Patient	$2a$10$IPMIowNTkHpZBUhqAyHgquEtws4zq5pvRA7b7SJGop5dlDdHGZxhW	1234567890	\N	PATIENT	\N
\.


--
-- TOC entry 3450 (class 0 OID 0)
-- Dependencies: 217
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.appointments_id_seq', 22, true);


--
-- TOC entry 3451 (class 0 OID 0)
-- Dependencies: 220
-- Name: medicine_generics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.medicine_generics_id_seq', 5, true);


--
-- TOC entry 3452 (class 0 OID 0)
-- Dependencies: 222
-- Name: medicine_timings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.medicine_timings_id_seq', 42, true);


--
-- TOC entry 3453 (class 0 OID 0)
-- Dependencies: 224
-- Name: medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.medicines_id_seq', 12, true);


--
-- TOC entry 3454 (class 0 OID 0)
-- Dependencies: 227
-- Name: prescription_medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.prescription_medicines_id_seq', 27, true);


--
-- TOC entry 3455 (class 0 OID 0)
-- Dependencies: 229
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 30, true);


--
-- TOC entry 3456 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- TOC entry 3241 (class 2606 OID 237868)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 3243 (class 2606 OID 237875)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3247 (class 2606 OID 237884)
-- Name: medicine_generics medicine_generics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicine_generics
    ADD CONSTRAINT medicine_generics_pkey PRIMARY KEY (id);


--
-- TOC entry 3251 (class 2606 OID 237895)
-- Name: medicine_timings medicine_timings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicine_timings
    ADD CONSTRAINT medicine_timings_pkey PRIMARY KEY (id);


--
-- TOC entry 3253 (class 2606 OID 237905)
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- TOC entry 3255 (class 2606 OID 237911)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3257 (class 2606 OID 237920)
-- Name: prescription_medicines prescription_medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT prescription_medicines_pkey PRIMARY KEY (id);


--
-- TOC entry 3259 (class 2606 OID 237929)
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 3245 (class 2606 OID 237942)
-- Name: doctors uk_1xu5x0jae737xae254t4rgcd1; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT uk_1xu5x0jae737xae254t4rgcd1 UNIQUE (license_number);


--
-- TOC entry 3261 (class 2606 OID 237946)
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- TOC entry 3249 (class 2606 OID 237944)
-- Name: medicine_generics uk_hvmxdnkj9tkvamvhchg4qnp3f; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicine_generics
    ADD CONSTRAINT uk_hvmxdnkj9tkvamvhchg4qnp3f UNIQUE (generic_name);


--
-- TOC entry 3263 (class 2606 OID 237940)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3270 (class 2606 OID 237982)
-- Name: prescription_medicines fk14vcxytfp7rr81y9fdhl37bbw; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT fk14vcxytfp7rr81y9fdhl37bbw FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- TOC entry 3272 (class 2606 OID 237987)
-- Name: prescriptions fke2fpvlkkcgcd40k4ufyyju2al; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fke2fpvlkkcgcd40k4ufyyju2al FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- TOC entry 3266 (class 2606 OID 237957)
-- Name: doctors fke9pf5qtxxkdyrwibaevo9frtk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fke9pf5qtxxkdyrwibaevo9frtk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3273 (class 2606 OID 237997)
-- Name: prescriptions fkhj0lpwb4asfw8xpdbakouxl1t; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fkhj0lpwb4asfw8xpdbakouxl1t FOREIGN KEY (patient_user_id) REFERENCES public.users(id);


--
-- TOC entry 3274 (class 2606 OID 237992)
-- Name: prescriptions fkhl8mn4b4ayy0l2bej0d9djb1l; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fkhl8mn4b4ayy0l2bej0d9djb1l FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- TOC entry 3271 (class 2606 OID 237977)
-- Name: prescription_medicines fkkljsa0768eycowt9le7nb215q; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_medicines
    ADD CONSTRAINT fkkljsa0768eycowt9le7nb215q FOREIGN KEY (medicine_id) REFERENCES public.medicines(id);


--
-- TOC entry 3268 (class 2606 OID 237967)
-- Name: medicines fknl7gxvfkpl2lpw0lmyvceuqpt; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT fknl7gxvfkpl2lpw0lmyvceuqpt FOREIGN KEY (generic_id) REFERENCES public.medicine_generics(id);


--
-- TOC entry 3264 (class 2606 OID 237947)
-- Name: appointments fkpp58gq2mq4ecsbwcbxvy49ank; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fkpp58gq2mq4ecsbwcbxvy49ank FOREIGN KEY (doctor_user_id) REFERENCES public.users(id);


--
-- TOC entry 3267 (class 2606 OID 237962)
-- Name: medicine_timings fkseboqk1c1lqo8r2ud9keurmxj; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medicine_timings
    ADD CONSTRAINT fkseboqk1c1lqo8r2ud9keurmxj FOREIGN KEY (prescription_medicine_id) REFERENCES public.prescription_medicines(id);


--
-- TOC entry 3265 (class 2606 OID 237952)
-- Name: appointments fksvnkjcycyc8v0jeh1vklfsmm8; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fksvnkjcycyc8v0jeh1vklfsmm8 FOREIGN KEY (patient_user_id) REFERENCES public.users(id);


--
-- TOC entry 3269 (class 2606 OID 237972)
-- Name: patients fkuwca24wcd1tg6pjex8lmc0y7; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT fkuwca24wcd1tg6pjex8lmc0y7 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3442 (class 0 OID 0)
-- Dependencies: 3441
-- Name: DATABASE neondb; Type: ACL; Schema: -; Owner: neondb_owner
--

GRANT ALL ON DATABASE neondb TO neon_superuser;


--
-- TOC entry 2083 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2082 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-06-19 10:44:30

--
-- PostgreSQL database dump complete
--

