--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE authenticator;
ALTER ROLE authenticator WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;

CREATE ROLE bruce;
ALTER ROLE bruce WITH SUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;

CREATE ROLE web_anon;
ALTER ROLE web_anon WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
COMMENT ON ROLE web_anon IS 'web_anon access';

CREATE ROLE python_api;
ALTER ROLE python_api WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
--
-- Role memberships
--

GRANT web_anon TO authenticator GRANTED BY postgres;


--
-- Database "mrg" dump
--

-- Name: mrg; Type: DATABASE; Schema: -; Owner: postgres
--

\connect mrg

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: people; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA people;


ALTER SCHEMA people OWNER TO postgres;

--
-- Name: robots; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA robots;


ALTER SCHEMA robots OWNER TO postgres;

-- Grant Schema permissions
GRANT usage ON SCHEMA robots to web_anon GRANTED by postgres;
GRANT usage ON SCHEMA people to web_anon GRANTED by postgres;
GRANT usage ON SCHEMA robots to python_api GRANTED by postgres;
--
-- Name: check_in_status; Type: TYPE; Schema: robots; Owner: postgres
--

CREATE TYPE robots.check_in_status AS ENUM (
    'UNKNOWN',
    'CHECKED-IN',
    'WITHDRAWN'
);


ALTER TYPE robots.check_in_status OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: robots; Owner: postgres
--

CREATE TYPE robots.payment_status AS ENUM (
    'CASH',
    'CHEQUE',
    'INVOICED',
    'COMPLEMENTARY',
    'CREDIT CARD',
    'UNPAID'
);


ALTER TYPE robots.payment_status OWNER TO postgres;

--
-- Name: slotting_status; Type: TYPE; Schema: robots; Owner: postgres
--

CREATE TYPE robots.slotting_status AS ENUM (
    'UNSEEN',
    'STANDBY',
    'DECLINED',
    'CONFIRMED',
    'WITHDRAWN'
);


ALTER TYPE robots.slotting_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: coaches; Type: TABLE; Schema: people; Owner: postgres
--

CREATE TABLE people.coaches (
    id integer NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    school character varying NOT NULL,
    phone numeric NOT NULL,
    email character varying NOT NULL
);


ALTER TABLE people.coaches OWNER TO postgres;


--
-- Name: students; Type: TABLE; Schema: people; Owner: postgres
--

CREATE TABLE people.students (
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    coach integer NOT NULL,
    id integer NOT NULL,
    birthday date NOT NULL
);


ALTER TABLE people.students OWNER TO postgres;

--
-- Name: activity-log; Type: TABLE; Schema: robots; Owner: postgres
--

CREATE TABLE robots."activity-log" (
    datetime timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    volunteer character varying,
    robot integer NOT NULL,
    function character varying(11),
    action character varying,
    id integer NOT NULL
);


ALTER TABLE robots."activity-log" OWNER TO postgres;

--
-- Name: COLUMN "activity-log".datetime; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots."activity-log".datetime IS 'Time that activity was recorded.';


--
-- Name: activity-log_id_seq; Type: SEQUENCE; Schema: robots; Owner: postgres
--

ALTER TABLE robots."activity-log" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME robots."activity-log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: competition; Type: TABLE; Schema: robots; Owner: postgres
--

CREATE TABLE robots.competition (
    id character(3) NOT NULL,
    name character(3),
    "longName" character varying,
    rings integer NOT NULL,
    "minRobotsPerRing" integer NOT NULL,
    "maxRobotsPerRing" integer NOT NULL,
    checkstring character varying,
    "registrationTime" timestamp with time zone DEFAULT now() NOT NULL,
    "measureMass" boolean NOT NULL,
    "measureSize" boolean NOT NULL,
    "measureTime" boolean NOT NULL,
    "measureScratch" boolean,
    "measureDeadman" boolean NOT NULL,
    "maxEntries" numeric GENERATED ALWAYS AS (("maxRobotsPerRing" * rings)) STORED,
    "robotCount" integer DEFAULT 0 NOT NULL,
    "robotCheckedInCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE robots.competition OWNER TO postgres;

--
-- Name: COLUMN competition."maxEntries"; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots.competition."maxEntries" IS 'Maxmum allowed number of robots for this competition';


--
-- Name: COLUMN competition."robotCount"; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots.competition."robotCount" IS 'Number of robots registered in this competition';


--
-- Name: COLUMN competition."robotCheckedInCount"; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots.competition."robotCheckedInCount" IS 'Number of robots checked in.';


--
-- Name: measurement; Type: TABLE; Schema: robots; Owner: postgres
--

CREATE TABLE robots.measurement (
    robot integer NOT NULL,
    datetime timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    result boolean,
    type character varying(32),
    volunteer character varying(50),
    id integer NOT NULL
);


ALTER TABLE robots.measurement OWNER TO postgres;

--
-- Name: COLUMN measurement.datetime; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots.measurement.datetime IS 'Time that measurement was recorded.';


--
-- Name: measurement_id_seq; Type: SEQUENCE; Schema: robots; Owner: postgres
--

ALTER TABLE robots.measurement ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME robots.measurement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ringAssignment; Type: TABLE; Schema: robots; Owner: postgres
--

CREATE TABLE robots."ringAssignment" (
    competition character(3),
    robot integer NOT NULL,
    ring integer NOT NULL,
    letter character(1),
    placed integer,
    id integer NOT NULL
);


ALTER TABLE robots."ringAssignment" OWNER TO postgres;

--
-- Name: ring-assignment_id_seq; Type: SEQUENCE; Schema: robots; Owner: postgres
--

ALTER TABLE robots."ringAssignment" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME robots."ring-assignment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: robot; Type: TABLE; Schema: robots; Owner: postgres
--

CREATE TABLE robots.robot (
    name character varying(100) NOT NULL,
    competition character varying(50) NOT NULL,
    driver1 character varying(50) NOT NULL,
    driver1gr character varying(50) DEFAULT 0 NOT NULL,
    driver2 character varying(50),
    driver2gr character varying(50),
    driver3 character varying(50),
    driver3gr character varying(50),
    school character varying(150),
    coach character varying(100),
    email character varying(100) NOT NULL,
    ph character varying(16) NOT NULL,
    invoiced numeric(4,2) DEFAULT 0 NOT NULL,
    paid numeric(4,2) DEFAULT 0 NOT NULL,
    late integer DEFAULT 0 NOT NULL,
    "checkInStatus" robots.check_in_status DEFAULT 'UNKNOWN'::robots.check_in_status NOT NULL,
    "paymentType" robots.payment_status DEFAULT 'UNPAID'::robots.payment_status NOT NULL,
    registered timestamp without time zone DEFAULT now() NOT NULL,
    participated boolean DEFAULT false NOT NULL,
    id integer NOT NULL,
    "slottedStatus" robots.slotting_status DEFAULT 'UNSEEN'::robots.slotting_status NOT NULL,
    measured boolean DEFAULT false NOT NULL
);


ALTER TABLE robots.robot OWNER TO postgres;

--
-- Name: COLUMN robot."slottedStatus"; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots.robot."slottedStatus" IS 'Current Slotted status of robot';


--
-- Name: COLUMN robot.measured; Type: COMMENT; Schema: robots; Owner: postgres
--

COMMENT ON COLUMN robots.robot.measured IS 'Had the robot been successfully measured.';


--
-- Name: robot_id_seq; Type: SEQUENCE; Schema: robots; Owner: postgres
--

ALTER TABLE robots.robot ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME robots.robot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: total; Type: TABLE; Schema: robots; Owner: postgres
--

CREATE TABLE robots.total (
    count bigint
);


ALTER TABLE robots.total OWNER TO postgres;

--
-- Name: count_competition_robots(); Type: FUNCTION; Schema: robots; Owner: postgres
--

CREATE FUNCTION robots.count_competition_robots() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
   total integer;
BEGIN
   IF OLD.competition IS NOT NULL THEN
      SELECT COUNT(*) into total FROM robots.robot WHERE competition = OLD.competition;
      UPDATE robots.competition set "robotCount" = total WHERE id = OLD.competition;
   END IF;
   IF NEW.competition is NOT NULL THEN
      SELECT COUNT(*) into total FROM robots.robot WHERE competition = NEW.competition;
      UPDATE robots.competition set "robotCount" = total WHERE id = NEW.competition;
   END IF;
RETURN NULL;
END;
$$;


ALTER FUNCTION robots.count_competition_robots() OWNER TO postgres;

--
-- Name: count_robots(); Type: FUNCTION; Schema: robots; Owner: postgres
--

CREATE FUNCTION robots.count_robots() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
   comp text;
   total integer;
BEGIN
   for comp IN SELECT id FROM robots.competition LOOP
      SELECT COUNT(*) into total FROM robots.robot WHERE competition = comp;
      UPDATE robots.competition set "robotCount" = total WHERE id = comp;
      RAISE NOTICE '% = %', comp, total;
   END LOOP;
END;
$$;


ALTER FUNCTION robots.count_robots() OWNER TO postgres;

--
-- Name: reset_measurement_status(); Type: FUNCTION; Schema: robots; Owner: postgres
--

CREATE FUNCTION robots.reset_measurement_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
	BEGIN
       update robots.robot set "measured" = false where "competition" = new.id;
       return null;
	END;
$$;


ALTER FUNCTION robots.reset_measurement_status() OWNER TO postgres;

--
-- Name: update_measured_status(); Type: FUNCTION; Schema: robots; Owner: postgres
--

CREATE FUNCTION robots.update_measured_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      competition_id text;
      robot_id integer;
      count integer;
      competition_rec RECORD;

      measurement RECORD;
      measured_ok boolean;
      passed boolean;
	begin
		-- Get the competition_id associated with this robot/measurement.
		select "competition" into competition_id from robots.robot where id = new.robot;

	    -- Get the competition record associated with this robot;
	    select * into competition_rec from competition where id = competition_id;

	    measured_ok := true;

	    -- Check to see if all the required measurements are satisfied.
	    if competition_rec."measureMass" then
	      select * into measurement from measurement
	        where robot = new.robot and type = 'Mass' ORDER by datetime DESC limit 1;
	      if((not found) or (measurement."result" = false) or (measurement."datetime" < competition_rec."registrationTime")) then
	         measured_ok := false;
	      end if;
	    end if;

	    if competition_rec."measureSize" then
	      select * into measurement from measurement
	        where robot = new.robot and type = 'Size' ORDER by datetime DESC limit 1;
	      if((not found) or (measurement."result" = false) or (measurement."datetime" < competition_rec."registrationTime")) then
	         measured_ok := false;
	      end if;
	    end if;

	    if competition_rec."measureScratch" then
	      select * into measurement from measurement
	        where robot = new.robot and type = 'Scratch' ORDER by datetime desc limit 1;
	      if((not found) or (measurement."result" = false) or (measurement."datetime" < competition_rec."registrationTime")) then
	         measured_ok := false;
	      end if;
	    end if;

	    if competition_rec."measureTime" then
	      select * into measurement from measurement
	        where robot = new.robot and type = 'Time' ORDER by datetime desc limit 1;
	      if((not found) or (measurement."result" = false) or (measurement."datetime" < competition_rec."registrationTime")) then
	         measured_ok := false;
	      end if;
	    end if;

	    if competition_rec."measureDeadman" then
	      select * into measurement from measurement
	        where robot = new.robot and type = 'Deadman' ORDER by datetime desc limit 1;
	      if((not found) or (measurement."result" = false) or (measurement."datetime" < competition_rec."registrationTime")) then
	         measured_ok := false;
	      end if;
	    end if;

	   -- Update the robot's measured status.
	   update robots.robot set measured = measured_ok where id = new.robot;
       return null;
	END;
$$;


ALTER FUNCTION robots.update_measured_status() OWNER TO postgres;

--
-- Name: update_slotted_status(); Type: FUNCTION; Schema: robots; Owner: postgres
--

CREATE FUNCTION robots.update_slotted_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
   maxEntries integer;
   checkedInCount integer;
   rec RECORD;
   checkedInOrUnknownCount integer;
   targetStatus robots."slotting_status";
BEGIN
   SELECT maxEntries INTO maxEntries
      FROM robot WHERE competition = NEW.competition;

   checkedInOrUnknownCount := 0;
   checkedInCount := 0;
   -- Select all the robots in this competition and order them by regisration time.
   -- The earliest robot first.
   FOR rec IN
      SELECT * FROM robot WHERE
             competition = NEW.competition
         ORDER BY registered ASC
    loop
      IF rec.id = NEW.id THEN
         rec := NEW;
      END IF;

      IF rec."checkInStatus" = 'CHECKED-IN' THEN
         checkedInOrUnknownCount := checkedInOrUnknownCount + 1;
         checkedInCount := checkedInCount + 1;

         IF checkedInCount > maxEntries THEN
            targetStatus := 'DECLINED';

         ELSIF checkedInOrUnknownCount > maxEntries THEN
            targetStatus := 'STANDBY';

         ELSE
            targetStatus := 'CONFIRMED';
         END IF;

      ELSIF rec."checkInStatus" = 'UNKNOWN' THEN
         checkedInOrUnknownCount = checkedInOrUnknownCount + 1;

         IF checkedInCount >= maxEntries THEN
            targetStatus := 'DECLINED';
         ELSE
            targetStatus := 'UNSEEN';
         END IF;

      ELSIF rec."checkInStatus" = 'WITHDRAWN' THEN
            targetStatus := 'WITHDRAWN';
      END IF;

     --RAISE NOTICE 'robot: % status %', rec.name, targetStatus;

      -- Write the target status to the row or update NEW if this is the same record.
      IF rec.id = NEW.id THEN
         NEW."slottedStatus" := targetStatus;
      ELSIF rec."slottedStatus" != targetStatus THEN
         UPDATE robot set "slottedStatus" = targetStatus WHERE id = rec.id;
      END IF;
   END LOOP;

   UPDATE competition SET "robotCheckedInCount" = checkedInCount WHERE id = NEW.competition;

   RETURN NEW;
END;
$$;


ALTER FUNCTION robots.update_slotted_status() OWNER TO postgres;

-- Grant tables access to python_api
GRANT SELECT,UPDATE,DELETE,INSERT ON ALL TABLES IN SCHEMA robots TO python_api;

--
-- Data for Name: competition; Type: TABLE DATA; Schema: robots; Owner: postgres
--

COPY robots.competition (id, name, "longName", rings, "minRobotsPerRing", "maxRobotsPerRing", checkstring, "registrationTime", "measureMass", "measureSize", "measureTime", "measureScratch", "measureDeadman", "robotCount", "robotCheckedInCount") FROM stdin;
SSL	SSL	Super Scramble Light	2	4	8	i	2023-02-06 11:36:42.201776-06	t	t	f	f	f	19	0
DRA	DRA	Drag Race Autonomous	1	2	2	i	2023-02-06 11:36:42.201776-06	f	t	f	t	f	5	3
LFK	LFK	Line Follower - Kit	1	1	1	i	2023-02-06 11:36:42.201776-06	f	t	f	f	f	0	0
LMA	LMA	Line Maze Autonomous	1	1	1	i	2023-02-06 11:36:42.201776-06	f	t	f	t	f	2	0
MSR	MSR	Mini Sumo Rookie	4	4	8	i	2023-02-06 11:36:42.201776-06	t	f	f	t	f	15	13
PST	PST	Prarie Sumo Tethered	4	4	8	i	2023-02-06 11:36:42.201776-06	t	t	f	t	f	18	7
PSA	PSA	Prarie Sumo Autonomous	4	4	8	i	2023-02-06 11:36:42.201776-06	t	t	t	t	f	6	5
SSH	SSH	Super Scramble Heavy	1	4	8	i	2023-02-06 11:36:42.201776-06	t	t	f	t	f	3	1
MS2	MS2	Mini Sumo 2	4	4	8	i	2023-02-06 11:36:42.201776-06	t	f	f	t	f	9	9
MS1	MS1	Mini Sumo 1	8	4	8	i	2023-02-06 12:16:13.069706-06	t	f	f	t	f	10	9
TPM	TPM	Tractor Pull	1	4	10	i	2023-02-06 11:36:42.201776-06	t	t	t	f	t	7	1
MSA	MSA	Mini Sumo Autonomous	8	4	8	i	2023-02-06 11:36:42.201776-06	t	f	t	t	f	16	14
JC1	JC1	Judges' Choice	4	4	8	i	2023-02-06 11:36:42.201776-06	f	f	f	f	f	2	1
RC1	RC1	Robo Critter	1	1	1	i	2023-02-06 11:36:42.201776-06	f	f	f	f	f	8	2
MS3	MS3	Mini Sumo 3	8	4	8	i	2023-02-06 11:36:42.201776-06	t	f	f	t	f	18	10
SSR	SSR	Super Scramble Rookie	5	2	2	i	2023-02-06 11:36:42.201776-06	t	t	f	f	f	5	5
LFS	LFS	Line Follower - Scratch	4	4	8	i	2023-02-06 11:36:42.201776-06	f	t	f	f	f	46	6
NXT	NXT	Lego Challenge	4	4	8	i	2023-02-06 11:36:42.201776-06	f	f	f	f	f	6	12
\.


--
-- Name: activity-log_id_seq; Type: SEQUENCE SET; Schema: robots; Owner: postgres
--

SELECT pg_catalog.setval('robots."activity-log_id_seq"', 257, true);


--
-- Name: measurement_id_seq; Type: SEQUENCE SET; Schema: robots; Owner: postgres
--

SELECT pg_catalog.setval('robots.measurement_id_seq', 190, true);


--
-- Name: ring-assignment_id_seq; Type: SEQUENCE SET; Schema: robots; Owner: postgres
--

SELECT pg_catalog.setval('robots."ring-assignment_id_seq"', 119, true);


--
-- Name: robot_id_seq; Type: SEQUENCE SET; Schema: robots; Owner: postgres
--

SELECT pg_catalog.setval('robots.robot_id_seq', 476, true);


--
-- Name: students students_pk; Type: CONSTRAINT; Schema: people; Owner: postgres
--

ALTER TABLE ONLY people.students
    ADD CONSTRAINT students_pk PRIMARY KEY (id);


--
-- Name: coaches teacher_pk; Type: CONSTRAINT; Schema: people; Owner: postgres
--

ALTER TABLE ONLY people.coaches
    ADD CONSTRAINT teacher_pk PRIMARY KEY (id);


--
-- Name: activity-log activity_log_pk; Type: CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots."activity-log"
    ADD CONSTRAINT activity_log_pk PRIMARY KEY (id);


--
-- Name: competition competitions_pk; Type: CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots.competition
    ADD CONSTRAINT competitions_pk PRIMARY KEY (id);


--
-- Name: measurement measurement_pk; Type: CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots.measurement
    ADD CONSTRAINT measurement_pk PRIMARY KEY (id);


--
-- Name: ringAssignment ring_assignment_pk; Type: CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots."ringAssignment"
    ADD CONSTRAINT ring_assignment_pk PRIMARY KEY (id);


--
-- Name: robot robot_pk; Type: CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots.robot
    ADD CONSTRAINT robot_pk PRIMARY KEY (id);


--
-- Name: activity_log_robot_idx; Type: INDEX; Schema: robots; Owner: postgres
--

CREATE INDEX activity_log_robot_idx ON robots."activity-log" USING btree (robot);


--
-- Name: measurement_robot_idx; Type: INDEX; Schema: robots; Owner: postgres
--

CREATE INDEX measurement_robot_idx ON robots.measurement USING btree (robot);


--
-- Name: robot count_competition_robots; Type: TRIGGER; Schema: robots; Owner: postgres
--

CREATE TRIGGER count_competition_robots AFTER INSERT OR UPDATE OF competition ON robots.robot FOR EACH ROW EXECUTE FUNCTION robots.count_competition_robots();


--
-- Name: competition reset_robot_measurements; Type: TRIGGER; Schema: robots; Owner: postgres
--

CREATE TRIGGER reset_robot_measurements AFTER UPDATE OF "registrationTime" ON robots.competition FOR EACH ROW EXECUTE FUNCTION robots.reset_measurement_status();


--
-- Name: measurement update_measurement; Type: TRIGGER; Schema: robots; Owner: postgres
--

CREATE TRIGGER update_measurement AFTER INSERT ON robots.measurement FOR EACH ROW EXECUTE FUNCTION robots.update_measured_status();


--
-- Name: robot update_slotting_status; Type: TRIGGER; Schema: robots; Owner: postgres
--

CREATE TRIGGER update_slotting_status BEFORE UPDATE OF "checkInStatus" ON robots.robot FOR EACH ROW EXECUTE FUNCTION robots.update_slotted_status();


--
-- Name: students students_fk; Type: FK CONSTRAINT; Schema: people; Owner: postgres
--

ALTER TABLE ONLY people.students
    ADD CONSTRAINT students_fk FOREIGN KEY (coach) REFERENCES people.coaches(id);


--
-- Name: activity-log activity_log_fk; Type: FK CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots."activity-log"
    ADD CONSTRAINT activity_log_fk FOREIGN KEY (robot) REFERENCES robots.robot(id);


--
-- Name: robot competition; Type: FK CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots.robot
    ADD CONSTRAINT competition FOREIGN KEY (competition) REFERENCES robots.competition(id);


--
-- Name: measurement measurement_fk; Type: FK CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots.measurement
    ADD CONSTRAINT measurement_fk FOREIGN KEY (robot) REFERENCES robots.robot(id);


--
-- Name: ringAssignment ring_assignment_comp_fk; Type: FK CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots."ringAssignment"
    ADD CONSTRAINT ring_assignment_comp_fk FOREIGN KEY (competition) REFERENCES robots.competition(id);


--
-- Name: ringAssignment ring_assignment_robot_fk; Type: FK CONSTRAINT; Schema: robots; Owner: postgres
--

ALTER TABLE ONLY robots."ringAssignment"
    ADD CONSTRAINT ring_assignment_robot_fk FOREIGN KEY (robot) REFERENCES robots.robot(id);


--
-- Name: SCHEMA robots; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA robots TO web_anon;


--
-- Name: TABLE "activity-log"; Type: ACL; Schema: robots; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE robots."activity-log" TO web_anon;


--
-- Name: TABLE competition; Type: ACL; Schema: robots; Owner: postgres
--

GRANT SELECT,UPDATE ON TABLE robots.competition TO web_anon;


--
-- Name: TABLE measurement; Type: ACL; Schema: robots; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE robots.measurement TO web_anon;


--
-- Name: TABLE "ringAssignment"; Type: ACL; Schema: robots; Owner: postgres
--

GRANT SELECT ON TABLE robots."ringAssignment" TO web_anon;


--
-- Name: TABLE robot; Type: ACL; Schema: robots; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE robots.robot TO web_anon;


--
-- PostgreSQL database dump complete
--
