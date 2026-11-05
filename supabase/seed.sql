select set_config('app.actor','synthetic-demo',true);
insert into experts(id,code,name,email,organisation,region,reviewed_on,retention_review,purpose,notice_evidence) values
('10000000-0000-4000-8000-000000000001','EXP-01','Aroha Bennett','aroha@example.invalid','Harbour Standards','NZ',current_date-10,current_date+300,'Professional panel participation','Demo privacy notice receipt'),
('10000000-0000-4000-8000-000000000002','EXP-02','Maya Chen','maya@example.invalid','Southern Assessment','AU',current_date-400,current_date-2,'Professional panel participation','Demo privacy notice receipt'),
('10000000-0000-4000-8000-000000000003','EXP-03','Daniel Reid','daniel@example.invalid','Coastal Institute','NZ',current_date-5,current_date+300,'Professional panel participation','Demo privacy notice receipt'),
('10000000-0000-4000-8000-000000000004','EXP-04','Maya Patel','mpatel@example.invalid','Independent specialist','AU',current_date-2,current_date+300,'Professional panel participation','Demo privacy notice receipt') on conflict do nothing;
insert into panels(id,code,name,purpose,starts_on,ends_on,owner) values
('20000000-0000-4000-8000-000000000001','PANEL-01','Water Standards Panel','Review professional assessment guidance',current_date-30,current_date+180,'Morgan Taylor'),
('20000000-0000-4000-8000-000000000002','PANEL-02','Assessment Methods Group','Review assessment methodology',current_date-20,current_date+240,'Casey Brown') on conflict do nothing;
insert into roles(id,panel_id,name,skill,minimum_level,seats) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Chair','Facilitation',4,1),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Specialist','Water assessment',3,2),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','Reviewer','Assessment design',3,2) on conflict do nothing;
insert into skills(id,expert_id,name,level,valid_until,evidence) values
('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Facilitation',5,current_date+365,'Demo chair reference'),
('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Water assessment',4,current_date+10,'Demo technical review'),
('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Water assessment',4,current_date+365,'Demo technical review'),
('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003','Assessment design',4,current_date+365,'Demo assessment reference'),
('40000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000004','Water assessment',5,current_date+365,'Demo technical review') on conflict do nothing;
insert into clearances(id,expert_id,panel_id,conflict,nda_until,valid_until,evidence) values
('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','clear',current_date+365,current_date+365,'Demo signed declaration'),
('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','blocked',current_date-1,current_date+365,'Demo competing engagement'),
('50000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','clear',current_date+365,current_date+365,'Demo signed declaration'),
('50000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','clear',current_date+365,current_date+365,'Demo signed declaration') on conflict do nothing;
insert into terms(id,code,expert_id,role_id,starts_on,ends_on,status,decision_evidence) values
('60000000-0000-4000-8000-000000000001','TERM-01','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',current_date-30,current_date+20,'accepted','Demo appointment minute'),
('60000000-0000-4000-8000-000000000002','TERM-02','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002',current_date-20,current_date+120,'proposed',''),
('60000000-0000-4000-8000-000000000003','TERM-03','10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000002',current_date-20,current_date+160,'accepted','Demo appointment minute'),
('60000000-0000-4000-8000-000000000004','TERM-04','10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003',current_date-10,current_date+200,'accepted','Demo appointment minute') on conflict do nothing;
insert into actions(id,code,panel_id,title,owner,due_on) values
('70000000-0000-4000-8000-000000000001','ACT-01','20000000-0000-4000-8000-000000000001','Review the competing engagement declaration','Morgan Taylor',current_date-3),
('70000000-0000-4000-8000-000000000002','ACT-02','20000000-0000-4000-8000-000000000002','Confirm next review agenda','Casey Brown',current_date+5) on conflict do nothing;
insert into notes(id,panel_id,body,actor,created_at) values
('80000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Synthetic panel: chair succession needs a decision.','synthetic-demo',now()-interval '25 days') on conflict do nothing;
