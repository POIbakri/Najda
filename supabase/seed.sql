-- Realistic Arabic-first demo responders near Al Qua'a (~23.53, 55.49).
-- Run after schema.sql. Mirrors the demo store's seed so both modes feel alike.

insert into profiles (name, phone, language, is_responder, is_available, home_lat, home_lng, skills) values
  ('سالم المنصوري', '+971500000001', 'ar', true, true,  23.541, 55.492, 'إسعافات أولية'),
  ('فاطمة الكعبي',  '+971500000002', 'ar', true, true,  23.527, 55.478, 'ممرضة'),
  ('Imran Khan',     '+971500000003', 'ur', true, true,  23.550, 55.500, 'Driver, CPR'),
  ('خالد الشامسي',  '+971500000004', 'ar', true, false, 23.520, 55.460, 'دفاع مدني سابق'),
  ('Aisha Rahman',   '+971500000005', 'en', true, true,  23.515, 55.505, 'First aid');
