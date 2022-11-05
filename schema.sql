`" "\\copy public.answers_photos (id, answer_id, url) FROM '/Users/nickamenda/Downloads/drive-download-20221102T141812Z-001/answers_photos.csv' DELIMITER ',' CSV HEADER QUOTE '\"' ESCAPE '''';""`

`" "\\copy public.answers (id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful) FROM '/Users/nickamenda/Downloads/drive-download-20221102T141812Z-001/answers.csv' DELIMITER ',' CSV HEADER QUOTE '\"' ESCAPE '''';""`

`" "\\copy public.questions (id, product_id, body, date_written, asker_name, asker_email, reported, helpful) FROM '/Users/nickamenda/Downloads/drive-download-20221102T141812Z-001/questions.csv' DELIMITER ',' CSV HEADER QUOTE '\"' ESCAPE '''';""`