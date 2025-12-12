-- Delete demo students first
DELETE FROM users WHERE email IN ('alice@student.com', 'bob@student.com', 'charlie@student.com');

-- Insert your real students
INSERT INTO users (name, email, password, role, roll_no, class_id) VALUES
('Adula Supriya', 'supriya.adula@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2001', 'class-demo'),
('Barre Nikitha', 'nikitha.barre@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2002', 'class-demo'),
('Mohd Musharraf Gouri', 'musharrafgouri.mohd@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2003', 'class-demo'),
('Boyapally Harshavardhan Reddy', 'harshavardhanreddy.boyapally@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2004', 'class-demo'),
('Samala Chandrasekhar Reddy', 'chandrasekharreddy.samala@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2005', 'class-demo'),
('Amudala Ankitha', 'ankitha.amudala@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2006', 'class-demo'),
('Nalla Krishna Saroj', 'krishnasaroj.nalla@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2007', 'class-demo'),
('Jatavath Asha', 'asha.jatavath@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2008', 'class-demo'),
('Katakam Nithin', 'nithin.katakam@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2009', 'class-demo'),
('Dandanayakula Adithya', 'adithya.dandanayakula@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2010', 'class-demo'),
('Dasthari Sharavani', 'sharavani.dasthari@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2011', 'class-demo'),
('Vallapu Shiva Shankar', 'shivashankar.vallapu@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2012', 'class-demo'),
('Syed Bahauddin', 'bahauddin.syed@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2013', 'class-demo'),
('Shaik Sameer', 'sameer.shaik@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2014', 'class-demo'),
('Korva Srikar', 'srikar.korva@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2015', 'class-demo'),
('Sathani Vishnuvardhan', 'vishnuvardhan.sathani@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2016', 'class-demo'),
('Trupti Panigrahi', 'panigrahi.trupti@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2017', 'class-demo'),
('Chintakunta Abhinay', 'abhinay.chintakunta@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2018', 'class-demo'),
('Jalles Praveen', 'praveen.jallela@aurora.edu.in', 'aurora@2025$', 'STUDENT', '242P4R2019', 'class-demo')
ON CONFLICT (email) DO NOTHING;

-- Verify the insert
SELECT COUNT(*) as total_students FROM users WHERE role = 'STUDENT';
