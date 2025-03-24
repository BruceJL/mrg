--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+1)

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
-- Data for Name: robot; Type: TABLE DATA; Schema: robots; Owner: postgres
--

COPY robots.robot (name, competition, driver1, driver1gr, driver2, driver2gr, driver3, driver3gr, school, coach, email, ph, invoiced, paid, late, "checkInStatus", "paymentType", registered, participated, id, "slottedStatus", measured) FROM stdin;
The Line Raptor	LFS	Stinky Miles	7	\N	\N	\N	\N	Broad River Elementary School	Ryder Stone	fiona.miles@example.com	204-555-0145	0.00	10.00	0	CHECKED-IN	INVOICED	2023-03-09 23:20:27	f	403	CONFIRMED	f
Abschlepper	TPM	Cliff Hanger	11	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	UNKNOWN	INVOICED	2023-03-10 11:03:17	f	398	UNSEEN	f
Conner	MS3	Grant Stone	9	Justin Sue Flaye	9	\N	\N	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:37:10	t	412	CONFIRMED	f
Zac Bot	MSA	Dewey Cheatem	5	Sandy Beaches	4	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	UNPAID	2023-03-10 11:20:20	t	391	CONFIRMED	f
Empire	MSA	Mila West	11	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	UNPAID	2023-03-10 11:24:40	t	388	CONFIRMED	f
Soup Can	MSA	Bud Lightyear	11	Pat Myback	6	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	UNPAID	2023-03-10 11:26:23	t	387	CONFIRMED	f
Dozer	MSA	Harper Flynn	8	Cliff Hanger	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 11:15:32	t	393	CONFIRMED	f
Challenger LOL	PST	Zachary Wells	7	Ima Pigg	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 21:01:02	t	410	CONFIRMED	f
Apatchee	MS1	Tina Tofu	6	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 21:06:46	t	407	CONFIRMED	f
Robert	PST	Cliff Hanger	11	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 11:01:35	t	399	CONFIRMED	f
Bobby	MS1	Pat Myback	6	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 11:11:22	t	395	CONFIRMED	f
Tank	PST	Zachary Wells	7	Ima Pigg	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 20:59:44	t	411	CONFIRMED	f
Schmetterling	MS3	Clara Dawn	11	Otto Correct	7	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:49:19	t	380	CONFIRMED	f
Nebuchadnezzer	LFS	Cliff Hanger	11	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 11:04:59	f	397	CONFIRMED	f
Big Brother ICU2	PSA	Owen Pierce	10	Skip Town	8	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 21:10:28	t	405	CONFIRMED	f
Bear	MSR	Ivy Jameson	6	Carrie Oakey	6	\N	\N	Whale Gulch Institute	Colton Hayes	harper.flynn@example.com	431-555-0224	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 14:22:43	t	374	CONFIRMED	f
Liney	LFS	Pat Myback	6	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	UNPAID	2023-03-10 11:06:23	f	396	CONFIRMED	f
R2D2	SSR	Max Wilder	11	\N	\N	\N	\N	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:34:46	t	414	CONFIRMED	f
Bloodhound	DRA	Owen Pierce	10	Skip Town	8	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:50:15	f	379	CONFIRMED	f
Drover	MS2	Harper Flynn	8	Cliff Hanger	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	UNPAID	2023-03-10 11:13:05	t	394	CONFIRMED	f
MegaBot	PST	Mila West	11	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 12:36:34	t	384	CONFIRMED	f
Ice Scraper	MS1	Sandy Beaches	4	Dewey Cheatem	5	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 11:21:40	t	390	CONFIRMED	f
Gripper	MS1	Dewey Cheatem	5	Sandy Beaches	4	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 11:17:55	t	392	CONFIRMED	f
Ring King	MS2	April Summers	7	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 21:03:38	t	408	CONFIRMED	f
zSwifty Bot	MS3	Tyler Brooks	11	Bob Loblaw	11	Chuck Steak	11	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:33:53	t	415	CONFIRMED	f
Tethered	MS2	Hazel Quinn	8	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 21:02:28	t	409	CONFIRMED	f
Guess Who	PSA	Nate Archer	10	Cliff Hanger	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	UNPAID	2023-03-10 11:23:35	t	389	CONFIRMED	f
I think I can	DRA	Cliff Hanger	11	Bud Lightyear	11	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 10:59:16	f	400	CONFIRMED	f
Obsidian Fury	LFS	Isla Frost	7	\N	\N	\N	\N	Broad River Elementary School	Ryder Stone	zachary.wells@example.com	431-555-0246	0.00	0.00	0	UNKNOWN	INVOICED	2023-03-10 09:18:50	f	401	UNSEEN	f
I dont know	MSR	Rowan Hale	5	Max Power	5	\N	\N	Whale Gulch Institute	Colton Hayes	harper.flynn@example.com	431-555-0224	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-18 08:57:14.163349	t	375	CONFIRMED	f
Cheese Whiz	PST	Bud Lightyear	11	Pat Myback	6	\N	\N	Broad River Elementary	Maren Blake	grant.stone@example.com	204-555-0167	0.00	0.00	0	CHECKED-IN	INVOICED	2023-03-10 12:34:47	t	385	CONFIRMED	f
R-T	DRA	Blake Lawson	9	Don Keigh	7	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:52:57	f	378	CONFIRMED	f
Thorin	NXT	Tessa Bloom	8	April May	8	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:28:43	f	449	CONFIRMED	f
Frog	NXT	Chase Hunter	7	Lou Natic	7	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-09 10:06:26	f	425	CONFIRMED	f
Radaghast	NXT	Lily Graves	8	Stan Still	11	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:31:53	f	448	CONFIRMED	f
Baddies	NXT	Jasper Cole	8	Barry Cade	7	Sally Forth	7	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	UNKNOWN	CREDIT CARD	2023-03-07 11:33:40	f	447	UNSEEN	f
Challenger	SSR	Brooke Winters	8	\N	\N	\N	\N	Seal Coast College	Lila Quinn	owen.pierce@example.com	204-555-0303	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 22:18:10	t	427	CONFIRMED	f
Jeff	MSA	Dewey Cheatem	10	Tina Tofu	5	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:43:25	t	382	CONFIRMED	f
the Lowly Beast	MSR	Al Beback	8	Crystal Clear	8	Hugh Jass	8	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	0.00	0	WITHDRAWN	UNPAID	2023-03-09 12:41:42	f	424	WITHDRAWN	f
Heracles	MS2	Rusty Nail	8	Rusty Nail	\N	\N	\N	Broad River Elementary	Ryder Stone	max.wilder@example.com	204-555-0345	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 23:10:06	t	426	CONFIRMED	f
Botacus	MSR	Stu Pid	7	Crystal Clear	8	Hugh Jass	8	South Fork University	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-09 12:41:49	t	423	CONFIRMED	f
Big Guss	PST	Stella Moon	7	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:56:34	t	433	CONFIRMED	f
Orange	MS2	Quinn Parker	9	Polly Tician	9	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 11:03:00	t	428	CONFIRMED	f
ff59	MSR	Hugh Jass	8	Crystal Clear	\N	Al Beback	8	South Fork University	Naomi Rivers	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-09 12:46:56	t	422	CONFIRMED	f
Eomor	NXT	Violet Lake	10	Art E. Choke	9	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:21:57	f	452	CONFIRMED	f
Samwise	NXT	Brock OLee	9	Gene Pool	11	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	0.00	0	WITHDRAWN	INVOICED	2023-03-07 11:27:18	f	450	WITHDRAWN	f
Alfred	MS1	Serena Vale	6	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:57:41	t	432	CONFIRMED	f
Roboemo	MSA	Donny Brook	7	Donny Brook	7	Ella Vator	7	Broad River Elementary	Ryder Stone	tyler.brooks@example.com	431-555-0389	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-07 12:31:11	t	444	CONFIRMED	f
Hit & Run	PSA	Jack Harper	9	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 11:01:50	t	429	CONFIRMED	f
Horatio Saladmaker	SSR	Eden Reid	11	Leo Rivers Gunn	11	Phil Mycup	11	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:28:43	t	418	CONFIRMED	f
Galadriel	NXT	Axel Steele	10	Mel Lowdrama	8	Brock OLee	9	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:39:53	f	445	CONFIRMED	f
Beenyboo	MS1	Ima Pigg	4	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:58:43	t	431	CONFIRMED	f
Rock-on	PST	Quinn Parker	9	Polly Tician	9	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:59:46	t	430	CONFIRMED	f
Winston	PSA	Ella Woods	12	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:17:07	t	441	CONFIRMED	f
El Fatso	MS3	Luna Shade	10	May B. Knot	10	Barb Dwyer	10	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:25:31	t	420	CONFIRMED	f
Agamemnon	MSA	Carson Bell	10	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	CASH	2023-03-08 10:20:32	t	440	CONFIRMED	f
Arwen	NXT	Archer Lane	7	Gail Force	10	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:17:10	f	454	CONFIRMED	f
The Brick	SSR	Morgan Reed	10	Sue Flay	10	Rick OShea	10	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:27:24	t	419	CONFIRMED	f
Gandalf	NXT	Wyatt Fields	10	Holly Day	9	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:20:48	f	453	CONFIRMED	f
Asterix	MSA	Chloe Sparks	6	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:28:46	t	436	CONFIRMED	f
Wacklschan	LFS	Cody Mason	6	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	CASH	2023-03-08 10:37:07	f	435	CONFIRMED	f
Gimli	NXT	Iris Drake	8	Al Luminum	8	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:25:54	f	451	CONFIRMED	f
Smaug	NXT	Grant Rivers	8	Ann Chovy	8	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:34:58	f	446	CONFIRMED	f
Pipin	NXT	Zoey Chase	12	Matt Finish	9	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:04:33	f	456	CONFIRMED	f
Rusty	MS3	Eve Ning	11	Joy Rider	11	Paige Turner	\N	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-09 13:24:32	t	421	CONFIRMED	f
CRU2	SSR	Jade Archer	10	\N	\N	\N	\N	Los Alamos Tech	Easton Vale	hazel.quinn@example.com	204-555-0404	20.00	20.00	0	CHECKED-IN	UNPAID	2023-03-18 08:41:20.040089	t	472	CONFIRMED	f
Mr. Draws Alot	JC1	Easton Frost	7	\N	\N	\N	\N	Broad River Elementary	Kiera Brooks	nate.archer@example.com	431-555-0422	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-02 19:39:52	f	459	CONFIRMED	f
Rodo	RC1	Moe Mentum	3	Barb E. Cue	5	\N	\N	Springfield Heights Institute of Technology	Knox Carter	isla.frost@example.com	431-555-0444	0.00	0.00	0	CHECKED-IN	INVOICED	2023-02-09 10:11:32	f	469	CONFIRMED	f
The Kamax	MS3	Willow Brook	12	Lance Boyle	12	\N	\N	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:29:58	t	417	CONFIRMED	f
Otis	MS3	Ryder Quinn	11	Ella Mentary	10	Will Power	12	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:32:50	t	416	CONFIRMED	f
The Shelled Hoister	MS3	Leo Rivers	9	Flip Switch	11	\N	\N	Collège Miles Macdonell Collegiate	Cruz Harper	mila.west@example.com	204-555-0189	0.00	10.00	0	CHECKED-IN	CASH	2023-03-09 15:35:57	t	413	CONFIRMED	f
Toothless	RC1	Barb E. Cue	5	Moe Mentum	3	\N	\N	Springfield Heights Institute of Technology	Knox Carter	isla.frost@example.com	431-555-0444	0.00	0.00	0	CHECKED-IN	INVOICED	2023-02-09 10:13:55	f	468	CONFIRMED	f
Legolas	NXT	Hannah Marsh	7	Harry Cane	7	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:11:03	f	455	CONFIRMED	f
Stringer	MS3	Joy Rider	11	Eve Ning	11	\N	\N	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CASH	2023-03-10 08:33:14	t	402	CONFIRMED	f
Ranger	MS1	Bud Lightyear	6	\N	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:52:19	t	434	CONFIRMED	f
Venom	MSA	Cliff Hanger	8	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:21:45	t	439	CONFIRMED	f
The Pancake	MSR	Tex T. Message	8	Crystal Clear	8	Hugh Jass	8	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-02 12:36:17	t	465	CONFIRMED	f
Elrond	NXT	Levi Blake	9	Sandy Castles	8	\N	\N	Palm Valley High	Weston Drake	clara.dawn@example.com	431-555-0268	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-07 11:00:56	f	457	CONFIRMED	f
FireWalker	MSA	Paisley Moon	7	\N	\N	\N	\N	Broad River Elementary	Piper James	rowan.hale@example.com	204-555-0505	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-02 18:50:54	t	461	CONFIRMED	f
ICU2	MSA	Owen Pierce	10	Skip Town	8	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-09 21:09:11	t	406	CONFIRMED	f
Lenox	LFS	Skylar West	8	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:23:30	f	438	CONFIRMED	f
Dave	MSR	Miles Carter	7	Dwayne Pipe	8	Hugh Jass	8	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-02 13:03:39	t	462	CONFIRMED	f
The Iron Giant	MSR	Cole Cuts	0	Crystal Clear	8	Al Beback	8	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-02 12:46:16	t	463	CONFIRMED	f
Plastic Power	MS2	Blake Lawson	9	Don Keigh	7	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 14:01:06	t	376	CONFIRMED	f
Parry	MS2	Autumn Banks	7	\N	\N	\N	\N	Broad River Elementary	Logan Steele	blake.lawson@example.com	204-555-0523	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-04 10:07:23	t	458	CONFIRMED	f
Dogg	MS2	Zachary Wells	7	Ima Pigg	4	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:55:44	t	377	CONFIRMED	f
Creed	MSA	Clara Dawn	11	Otto Correct	7	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:47:11	t	381	CONFIRMED	f
Fred	MSA	Hudson Fields	7	\N	\N	\N	\N	Broad River Elementary	Piper James	tessa.bloom@example.com	431-555-0547	0.00	10.00	0	CHECKED-IN	INVOICED	2023-03-09 21:57:11	t	404	CONFIRMED	f
CRU1	MSR	Callie Rivers	9	Doug Graves	9	\N	\N	Los Alamos Tech	Easton Vale	hazel.quinn@example.com	204-555-0404	20.00	20.00	0	CHECKED-IN	UNPAID	2023-03-18 08:38:09.40832	t	471	CONFIRMED	f
CRU3	MSR	Everett Scott	9	Hugh Mannity	9	\N	\N	Los Alamos Tech	Easton Vale	hazel.quinn@example.com	204-555-0404	20.00	20.00	0	CHECKED-IN	UNPAID	2023-03-18 08:43:54.134904	t	473	CONFIRMED	f
Socks	MSR	Levi Blake	9	Skip Ropes	\N	Crystal Clear	\N	South Fork University	Theo Morgan	ivy.jameson@example.com	431-555-0569	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-02 19:33:38	t	460	CONFIRMED	f
JC Activated	MSR	Al Beback	8	Cole Cuts	8	Stu Pid	7	South Fork University	Sydney Clark	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-02-28 13:20:20	t	466	CONFIRMED	f
Pedro	MS2	Sage Monroe	9	\N	\N	\N	\N	Emerald Springs High	Beau Lawson	chase.hunter@example.com	204-555-060	20.00	20.00	0	CHECKED-IN	UNPAID	2023-03-18 12:27:09.462053	t	475	CONFIRMED	f
Ring Leader	MS3	Dewey Cheatem	10	Otto Correct	\N	\N	\N	Redwood University	Talia Reid	ethan.drake@example.com	431-555-0202	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-10 13:40:18	t	383	CONFIRMED	f
Obelix	PSA	Pat Myback	12	Cliff Hanger Waldner	8	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:13:55	t	442	CONFIRMED	f
Ventom	MSA	Pat Myback	12	Cliff Hanger Waldner	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	CASH	2023-03-08 10:10:52	t	443	CONFIRMED	f
Bob	LFS	Jenna Sparks	0	\N	\N	\N	\N	Broad River Elementary	Ryder Stone	jenny.spark@example.com	204-555-0101	0.00	0.00	0	UNKNOWN	UNPAID	2023-03-10 16:28:24	f	373	UNSEEN	t
Paprika	LFS	Logan Hale	6	\N	\N	\N	\N	Broad River Elementary	Bryce Archer	april.summers@example.com	431-555-0367	0.00	10.00	0	CHECKED-IN	UNPAID	2023-03-08 10:26:08	f	437	CONFIRMED	t
Flash the Sloth	LFS	Leo Rivers	7	\N	\N	\N	\N	Broad River Elementary School	Ryder Stone	leo.rivers@example.com	204-555-0123	0.00	0.00	0	UNKNOWN	UNPAID	2023-03-10 12:26:08	f	386	UNSEEN	t
Lux Eternal	MSR	Crystal Clear	8	Tex T. Message	8	Al Beback	\N	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	CREDIT CARD	2023-03-02 12:44:40	t	464	CONFIRMED	f
Aras	MSR	Sandy Castles	8	Skip Ropes	8	Crystal Clear	8	Lakewood Grammar School	Theo Morgan	ivy.jameson@example.com	204-555-0321	0.00	10.00	0	CHECKED-IN	INVOICED	2023-02-28 13:19:40	t	467	CONFIRMED	t
\.



--
-- Data for Name: measurement; Type: TABLE DATA; Schema: robots; Owner: postgres
--

COPY robots.measurement (robot, datetime, result, type, volunteer, id) FROM stdin;
373	2025-03-24 21:35:45.733388+00	t	Size	\N	1
437	2025-03-24 21:35:50.383201+00	t	Size	\N	2
438	2025-03-24 21:36:01.199506+00	f	Size	\N	3
386	2025-03-24 21:36:08.434259+00	t	Size	\N	4
464	2025-03-24 21:36:42.72103+00	t	Mass	\N	5
464	2025-03-24 21:36:43.240309+00	f	Scratch	\N	6
467	2025-03-24 21:36:47.916089+00	t	Mass	\N	7
467	2025-03-24 21:36:48.355464+00	t	Scratch	\N	8
\.
