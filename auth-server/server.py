from flask import Flask, request, jsonify, g, session, send_from_directory, send_file
from werkzeug.utils import secure_filename
import sqlite3
from flask_cors import CORS
import datetime
import pytz
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.secret_key = 'VANAKKAMDAMAPLA2024'
CORS(app, supports_credentials=True)  # Enable CORS for all routes
DATABASE = 'database.db'
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'profile')
SUBMISSION_FOLDER = os.path.join(os.path.dirname(__file__), 'submit')
IST = pytz.timezone('Asia/Kolkata')

def connect_db():
    return sqlite3.connect(DATABASE)

def create_tables():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                name TEXT NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                student_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL UNIQUE,
                dob DATE NOT NULL,
                profile_picture TEXT,
                course_id INTEGER NOT NULL,
                doj DATE NOT NULL,
                staff_id INTEGER NOT NULL,
                id INTEGER NOT NULL,
                FOREIGN KEY (id) REFERENCES users(id),
                FOREIGN KEY (course_id) REFERENCES courses(course_id),
                FOREIGN KEY (staff_id) REFERENCES staffs(staff_id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS staffs (
                staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                id INTEGER NOT NULL,
                FOREIGN KEY (id) REFERENCES users(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                course_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_name TEXT NOT NULL UNIQUE,
                staff_id INTEGER,
                duration TEXT NOT NULL,
                fee_amount DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS fees (
                fee_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                fee_amount DECIMAL(10, 2) NOT NULL,
                paid_1st BOOL DEFAULT 0,
                date_1st DATE,
                paid_2nd BOOL DEFAULT 0,
                date_2nd DATE,
                paid_3rd BOOL DEFAULT 0,
                date_3rd DATE,
                FOREIGN KEY (course_id) REFERENCES courses(course_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                date DATE NOT NULL,
                is_present INTEGER,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS staffattendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                staff_id INTEGER,
                date DATE NOT NULL,
                is_present INTEGER,
                FOREIGN KEY (staff_id) REFERENCES staffs(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS staff_progress (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                staff_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                progress TEXT,
                FOREIGN KEY (staff_id) REFERENCES staff(id),
                FOREIGN KEY (course_id) REFERENCES courses(id)
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                task_description TEXT,
                deadline DATE,
                staff_id INTEGER,
                progress_date DATE,
                review TEXT,
                file_or_link TEXT,
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (staff_id) REFERENCES staffs(staff_id)
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                query_text TEXT NOT NULL,
                resolution_text TEXT,
                status TEXT DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alumni (
                alumni_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL UNIQUE,
                dob DATE NOT NULL,
                course_id INTEGER NOT NULL,
                doj DATE NOT NULL,
                staff_id INTEGER NOT NULL,
                graduated_date INTEGER NOT NULL,
                FOREIGN KEY (course_id) REFERENCES courses(course_id),
                FOREIGN KEY (staff_id) REFERENCES staffs(staff_id)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INT NOT NULL,
                question TEXT NOT NULL,
                option1 TEXT NOT NULL,
                option2 TEXT NOT NULL,
                option3 TEXT NOT NULL,
                option4 TEXT NOT NULL,
                correct_option INTEGER NOT NULL,
                FOREIGN KEY (course_id) REFERENCES courses(course_id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS connections (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                date TEXT NOT NULL, 
                name TEXT NOT NULL, 
                phone_number TEXT NOT NULL UNIQUE, 
                email TEXT NOT NULL UNIQUE, 
                interest TEXT, 
                source TEXT, 
                lead_stage TEXT, 
                lead_status TEXT, 
                course_id INTEGER NOT NULL, 
                messages TEXT,
                FOREIGN KEY (course_id) REFERENCES courses (course_id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mcq_assignments (
                id INTEGER PRIMARY KEY,
                student_id INTEGER UNIQUE,
                course_id INTEGER,
                deadline DATETIME,
                difficulty INTEGER,
                num_questions INTEGER,
                FOREIGN KEY (student_id) REFERENCES students (id),
                FOREIGN KEY (course_id) REFERENCES courses (id)
            );
            ''')
        
        db.commit()

        default_admin_username = 'admin@nextskill.com'
        default_admin_password = 'nextskill2024'  # You should hash this password in a real-world scenario

        cursor.execute('SELECT * FROM users WHERE email=?', (default_admin_username,))
        admin_user = cursor.fetchone()

        if not admin_user:
            hashed_password = hashlib.sha256(default_admin_password.encode()).hexdigest()
            cursor.execute('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', (default_admin_username, hashed_password,"Admin","admin"))
            db.commit()

def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

import hashlib

import hashlib

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    role = data.get('role', 'staff')

    if not email or not password or not name or role not in ['admin', 'staff']:
        return jsonify({'error': 'Invalid data provided'}), 400

    db = get_db()
    cursor = db.cursor()

    # Hash the password before storing it in the database
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    cursor.execute('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', (email, hashed_password, name, role))
    user_id = cursor.lastrowid  # Get the ID of the newly inserted user

    if role == 'staff':
        cursor.execute('INSERT INTO staffs (id, email, name) VALUES (?, ?, ?)', (user_id, email, name))

    db.commit()

    return jsonify({'message': 'User registered successfully'}), 201


# In your Flask app, modify the login route to include the user role in the response
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    db = get_db()
    cursor = db.cursor()

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    cursor.execute('SELECT * FROM users WHERE email=? AND password=?', (email, hashed_password))
    user = cursor.fetchone()

    if user:
        user_role = user[3]  # Assuming user role is at index 3 in the users table

        if user_role == 'admin' or user_role == 'staff' or user_role == 'student':
            # Store user role and user ID in session
            session['user_role'] = user[3]
            session['user_id'] = user[0]  # Assuming user_id is at index 0 in the users table
            if user[3] == 'staff':
                cursor.execute('SELECT staff_id FROM staffs WHERE id = ?',(user[0],))
                staffId = cursor.fetchone()
                return jsonify({'message': 'Login successful', 'userRole': user_role, 'userId': staffId}), 200
            if user[3] == 'student':
                cursor.execute('SELECT student_id FROM students WHERE id = ?',(user[0],))
                studentId = cursor.fetchone()
                return jsonify({'message': 'Login successful', 'userRole': user_role, 'userId': studentId}), 200

            return jsonify({'message': 'Login successful', 'userRole': user_role, 'userId': user[0]}), 200
        else:
            return jsonify({'error': 'Invalid user role'}), 403
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
    
def is_admin():
    return session.get('user_role') == 'admin'

def is_staff():
    return session.get('user_role') == 'staff'

@app.route('/api/auth-status',methods=['GET'])
def auth_status():
    if is_admin():
        return jsonify({'isAdmin':is_admin})
    return jsonify({'error': 'Only admins can enroll'}),400

@app.route('/api/update_user', methods=['POST'])
def update_user():
    data = request.json
    email = data.get('email')
    new_username = data.get('new_username')
    new_password = data.get('new_password')

    try:
        conn = sqlite3.connect('your_database.db')
        cursor = conn.cursor()

        # Find the user by email
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({'error': 'User not found'}), 404

        role = user[3]  # Assuming role is the fourth column in the users table

        # Update username and password
        if new_username:
            cursor.execute("UPDATE users SET name = ? WHERE email = ?", (new_username, email))
            if role == 'staff':
                cursor.execute("UPDATE staffs SET name = ? WHERE email = ?", (new_username, email))
        if new_password:
            hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
            cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_password, email))

        # Commit changes to the database
        conn.commit()
        conn.close()

        return jsonify({'message': 'User updated successfully'}), 200
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin-dashboard', methods=['GET'])
def admin_dashboard():
    db = get_db()
    cursor = db.cursor()

    # Fetch relevant data for each student along with the next fees due and fee_installment status
    cursor.execute('''
        SELECT students.student_id, students.name, students.email, staffs.name, courses.course_name, students.doj,
               fees.paid_1st, fees.date_1st, fees.paid_2nd, fees.date_2nd, fees.paid_3rd, fees.date_3rd, students.profile_picture
        FROM students
        JOIN staffs ON students.staff_id = staffs.staff_id
        JOIN courses ON students.course_id = courses.course_id
        LEFT JOIN fees ON students.student_id = fees.student_id AND students.course_id = fees.course_id
        ORDER BY students.student_id
    ''')

    students_data = cursor.fetchall()
    formatted_data = []
    
    for student in students_data:
        # Calculate the next fees due based on the provided logic
        joining_date = datetime.strptime(student[5], "%Y-%m-%d").date()
        current_date = datetime.now().date()
        one_month_from_joining = joining_date + timedelta(days=30)
        two_months_from_joining = joining_date + timedelta(days=60)

        if current_date <= joining_date and student[6] == 0:
            next_fees_due = "1st Installment Due"
        elif current_date <= one_month_from_joining and student[8] == 0:
            next_fees_due = one_month_from_joining
        elif current_date <= two_months_from_joining and student[10] == 0:
            next_fees_due = two_months_from_joining
        else:
            next_fees_due = "Paid"

        # Determine fee_installment status and update the current date if paid
        fee_installment_status = {
            '1st': {
                'status': "Not Paid" if not student[6] else "Paid",
                'date': current_date.strftime("%Y-%m-%d") if student[6] else None,
            },
            '2nd': {
                'status': "Not Paid" if not student[8] else "Paid",
                'date': current_date.strftime("%Y-%m-%d") if student[8] else None,
            },
            '3rd': {
                'status': "Not Paid" if not student[10] else "Paid",
                'date': current_date.strftime("%Y-%m-%d") if student[10] else None,
            },
        }

        # Calculate attendance percentage
        cursor.execute('''
            SELECT COUNT(*) FROM attendance
            WHERE student_id = ? AND is_present = 1
        ''', (student[0],))
        present_count = cursor.fetchone()[0]

        cursor.execute('''
            SELECT COUNT(*) FROM attendance
            WHERE student_id = ?
        ''', (student[0],))
        total_count = cursor.fetchone()[0]

        attendance_percentage = (present_count / total_count) * 100 if total_count > 0 else 0

        formatted_data.append({
            'id': student[0],
            'name': student[1],
            'email': student[2],
            'staff': student[3],
            'course': student[4],
            'nextFeesDue': next_fees_due,
            'feeInstallmentStatus': fee_installment_status,
            'attendancePercentage': attendance_percentage,
            'profile_picture':student[12]
        })

    return jsonify({'studentsData': formatted_data})


@app.route('/api/students/<int:student_id>/profile-picture', methods=['PUT'])
def update_profile_picture(student_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM students WHERE student_id = ?", (student_id,))
    student = cursor.fetchone()
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    # Check if the request contains a file
    if 'profilePicture' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['profilePicture']

    # Save the uploaded file to the server
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Save the uploaded file to the destination directory
        file_path = os.path.join(UPLOAD_FOLDER, f'{student_id}.jpg')
        file.save(file_path)

        # Update the profile picture path in the database
        cursor.execute("UPDATE students SET profile_picture = ? WHERE student_id = ?", (file_path, student_id))
        db.commit()

        return jsonify({'message': 'Profile picture updated successfully', 'profile_picture': file_path}), 200
    else:
        return jsonify({'message': 'Invalid file type'}), 400


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif','pdf','docx','docs','html','txt'}


@app.route('/api/students', methods=['GET'])
def get_students():
    db = get_db()
    course_id = request.args.get('course_id')
    query = """
        SELECT *
        FROM students
        WHERE 1
    """
        
    if course_id:
        query += f" AND course_id = {course_id}"

    cursor = db.cursor()
    cursor.execute(query)
    students_data = cursor.fetchall()

    students_list = []
    for student in students_data:
        students_list.append({
            'id':student[0],
            'name': student[1],
            'email': student[2],
            'course': student[3],
            'user_id': student[9]
        })
    return jsonify({'students': students_list})

@app.route('/api/staffs', methods=['GET'])
def get_staff():
    db = get_db()
    query = """
        SELECT *
        FROM staffs
        WHERE 1
    """

    cursor = db.cursor()
    cursor.execute(query)
    staffs_data = cursor.fetchall()

    staffs_list = []
    for staff in staffs_data:
        staffs_list.append({
            'id':staff[0],
            'name': staff[1],
            'email': staff[2],
        })
    return jsonify({'staffs': staffs_list})

@app.route('/api/staffs/<int:staff_id>', methods=['GET'])
def get_staff_by_id(staff_id):
    try:
        with get_db() as db:
            cursor = db.cursor()
            cursor.execute("""
                SELECT s.*, c.course_id, c.course_name
                FROM staffs s
                JOIN courses c ON s.staff_id = c.staff_id
                WHERE s.staff_id=?
            """, (staff_id,))
            staff = cursor.fetchone()
            return jsonify({'staff': staff}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/staff-dashboard/<int:staff_id>', methods=['GET'])
def staff_dashboard(staff_id):
    db = get_db()
    cursor = db.cursor()

    # Fetch relevant data for each student along with the next fees due and fee_installment status
    cursor.execute('''
        SELECT students.student_id, students.name, students.email, staffs.name, courses.course_name, students.doj, scores.score, students.profile_picture
        FROM students
        JOIN staffs ON students.staff_id = staffs.staff_id
        JOIN courses ON students.course_id = courses.course_id
        LEFT JOIN scores ON students.student_id = scores.student_id
        WHERE students.staff_id = ?
        ORDER BY students.student_id
    ''', (staff_id,))


    students_data = cursor.fetchall()
    formatted_data = []
    
    for student in students_data:
        # Calculate attendance percentage
        cursor.execute('''
            SELECT COUNT(*) FROM attendance
            WHERE student_id = ? AND is_present = 1
        ''', (student[0],))
        present_count = cursor.fetchone()[0]

        cursor.execute('''
            SELECT COUNT(*) FROM attendance
            WHERE student_id = ?
        ''', (student[0],))
        total_count = cursor.fetchone()[0]

        attendance_percentage = (present_count / total_count) * 100 if total_count > 0 else 0

        formatted_data.append({
            'id': student[0],
            'name': student[1],
            'email': student[2],
            'staff': student[3],
            'course': student[4],
            'score': student[6],
            'profile_picture':student[7],
            'attendance':attendance_percentage            
        })

    return jsonify({'studentsData': formatted_data})

@app.route('/api/staffs/<int:staff_id>/students', methods=['GET'])
def get_staff_students(staff_id):
    db = get_db()
    cursor = db.cursor()

    # Retrieve students for the specified staff member
    cursor.execute("""
        SELECT * FROM students WHERE staff_id=?
    """, (staff_id,))
    students_data = cursor.fetchall()

    students_list = []
    for student in students_data:
        students_list.append({
            'id': student[0],
            'name': student[1],
            'email': student[2]
        })
    return jsonify({'students': students_list})

@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        SELECT students.student_id, students.name, students.email, staffs.name, courses.course_name, students.doj,
            fees.paid_1st, fees.date_1st, fees.paid_2nd, fees.date_2nd, fees.paid_3rd, fees.date_3rd,  students.phone, students.id, students.course_id, scores.score
        FROM students
        JOIN staffs ON students.staff_id = staffs.staff_id
        JOIN courses ON students.course_id = courses.course_id
        LEFT JOIN fees ON students.student_id = fees.student_id AND students.course_id = fees.course_id
        LEFT JOIN scores on students.student_id = scores.student_id
        WHERE students.student_id = ?
        ORDER BY students.student_id;
    ''',(student_id,))
    student = cursor.fetchone()

    if student:
        formatted_data = []
        # Calculate the next fees due based on the provided logic
        joining_date = datetime.strptime(student[5], "%Y-%m-%d").date()
        current_date = datetime.now().date()
        one_month_from_joining = joining_date + timedelta(days=30)
        two_months_from_joining = joining_date + timedelta(days=60)

        if current_date <= joining_date and student[6] == 0:
            next_fees_due = "1st Installment Due"
        elif current_date <= one_month_from_joining and student[8] == 0:
            next_fees_due = "2nd Installment Due"
        elif current_date <= two_months_from_joining and student[10] == 0:
            next_fees_due = "3rd Installment Due"
        else:
            next_fees_due = "Paid"

        # Determine fee_installment status and update the current date if paid
        fee_installment_status = {
            '1st': {
                'status': "Not Paid" if not student[6] else "Paid",
                'date': current_date.strftime("%Y-%m-%d") if student[6] else None,
            },
            '2nd': {
                'status': "Not Paid" if not student[8] else "Paid",
                'date': current_date.strftime("%Y-%m-%d") if student[8] else None,
            },
            '3rd': {
                'status': "Not Paid" if not student[10] else "Paid",
                'date': current_date.strftime("%Y-%m-%d") if student[10] else None,
            },
        }
        formatted_data.append({
            'id': student[0],
            'name': student[1],
            'email': student[2],
            'staff': student[3],
            'course': student[4],
            'phone': student[12],
            'user_id': student[13],
            'course_id': student[14],
            'score':student[15],
            'nextFeesDue': next_fees_due,
            'feeInstallmentStatus': fee_installment_status,
        })

        return jsonify({'student': formatted_data[0]})
    else:
        return jsonify({'message': 'Student not found'}), 404

@app.route('/profile/<path:filename>')
def profile_picture(filename):
    return send_from_directory(os.path.join(app.root_path, 'profile'), filename)

@app.route('/api/courses', methods=['GET'])
def get_courses():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM courses')
    courses = cursor.fetchall()
    courses_list = []
    for course in courses:
        courses_list.append({
            'course_id': course[0],
            'course_name': course[1],
            'staff_id': course[2],
            'duration': course[3],
            'fee_amount': course[4],
        })

    return jsonify({'courses': courses_list})

@app.route('/api/update-course/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    data = request.get_json()
    course_name = data.get('course_name')
    staff_id = data.get('staff_id')
    duration = data.get('duration')
    fee_amount = data.get('fee_amount')

    if not course_name or not staff_id or not duration or fee_amount is None:
        return jsonify({'error': 'Course details are required'}), 400

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute('UPDATE courses SET course_name=?, staff_id=?, duration=?, fee_amount=? WHERE course_id=?',
                       (course_name, staff_id, duration, fee_amount, course_id))
        db.commit()
        return jsonify({'message': 'Course updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error updating course: {str(e)}'}), 500
    
@app.route('/api/add-course', methods=['POST'])
def add_course():
    data = request.get_json()
    course_name = data.get('course_name')
    staff_id = data.get('staff_id')
    duration = data.get('duration')
    fee_amount = data.get('fee_amount')

    if not course_name or not staff_id or not duration or fee_amount is None:
        return jsonify({'error': 'All fields are required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('INSERT INTO courses (course_name, staff_id, duration, fee_amount) VALUES (?, ?, ?, ?)',
                   (course_name, staff_id, duration, fee_amount))
    db.commit()

    return jsonify({'message': 'Course added successfully'}), 201

@app.route('/api/delete-course/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    # if not is_admin():
    #     return jsonify({'error': 'Unauthorized. Only admin can update courses'}), 403
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute('DELETE FROM courses WHERE course_id=?', (course_id,))
        db.commit()
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error deleting course: {str(e)}'}), 500

from datetime import datetime
def convert_dob(dob):
    # Convert the string to a datetime object
    dob_date = datetime.strptime(dob, "%Y-%m-%d")
    
    # Format the date as DDMMYYYY without symbols
    formatted_dob = dob_date.strftime("%d%m%Y")
    
    return formatted_dob
    
@app.route('/api/enroll', methods=['POST'])
def enroll_student():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    course = data.get('course')
    date_of_joining = data.get('doj')
    phone = data.get('phone')
    dobo = data.get('dob')
    dob = convert_dob(dobo)

    if not name or not email or not course or not date_of_joining or not phone or not dob:
        return jsonify({'error': 'All fields are required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT staffs.staff_id FROM staffs JOIN courses ON staffs.staff_id = courses.staff_id where courses.course_id=?',(course,))
    staff_id_tuple = cursor.fetchone()
    if staff_id_tuple:
        staff_id = staff_id_tuple[0]
    cursor.execute('SELECT * FROM students WHERE email=?', (email,))
    existing_student = cursor.fetchone()

    if existing_student:
        return jsonify({'error': 'Student with this email already exists'}), 400

    # Insert the new student into the database
    hashed_password = hashlib.sha256(dob.encode()).hexdigest()
    cursor.execute('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', (email, hashed_password, name, 'student'))
    db.commit()
    user_id = cursor.lastrowid
    
    cursor.execute('INSERT INTO students (name, email, course_id, doj, phone, staff_id, dob, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                   (name, email, course, date_of_joining, phone, staff_id, dob, user_id))
    db.commit()

    cursor.execute('SELECT courses.fee_amount from courses WHERE course_id = ?',(course))
    fee_amounts=cursor.fetchone()
    fee_amount=fee_amounts[0]
    cursor.execute('SELECT student_id FROM students WHERE email=?', (email,))
    current_students = cursor.fetchone()
    current_student=current_students[0]
    cursor.execute('INSERT INTO fees (student_id,course_id,fee_amount) VALUES (?,?,?)',(current_student,course,fee_amount))
    db.commit()

    # Update the Users table with user role, user id, and password
    return jsonify({'message': 'Student enrolled successfully'}), 201

@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.json
    edited_field = list(data.keys())[0]  # Get the edited field from the request body
    edited_value = data[edited_field]    # Get the new value of the edited field
    db = get_db()
    cursor = db.cursor()
    try:
        # Update only the edited field with the new value
        cursor.execute(
            f"UPDATE students SET {edited_field} = ? WHERE student_id = ?",
            (edited_value, student_id)
        )
        db.commit()
        return jsonify(message='Student details updated successfully'), 200
    except sqlite3.Error as e:
        db.rollback()
        return jsonify(message='Error updating student details'), 500
    finally:
        db.close()

# Route to move a student to the alumni table
@app.route('/api/students/<int:student_id>/alumni', methods=['POST'])
def move_to_alumni(student_id):
    graduated_year = request.json.get('graduated_year')
    db = get_db()
    cursor = db.cursor()
    # Retrieve student details before moving to alumni
    cursor.execute(
        "SELECT name, email, phone, dob, course_id, doj, staff_id FROM students WHERE student_id = :student_id",
        {"student_id": student_id}
    )
    student = cursor.fetchone()
    
    if student:
        name, email, phone, dob, course_id, doj, staff_id = student
        
        # Insert student details into alumni table
        cursor.execute(
            "INSERT INTO alumni (name, email, phone, dob, course_id, doj, staff_id, graduated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (name, email, phone, dob, course_id, doj, staff_id, graduated_year)
        )
        
        # Delete student from student table
        cursor.execute(
            "DELETE FROM students WHERE student_id = :student_id",
            {"student_id": student_id}
        )
        
        db.commit()
        db.close()
        
        return jsonify(message='Student moved to alumni successfully'), 200
    else:
        db.close()
        return jsonify(error='Student not found'), 404

@app.route('/api/alumni', methods=['GET'])
def get_alumni_details():
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "SELECT * FROM alumni"
        )
        alumni = cursor.fetchall()
        alumni_list = []
        for row in alumni:
            alumni_details = {
                "alumni_id": row[0],
                "name": row[1],
                "email": row[2],
                "phone": row[3],
                "dob": row[4],
                "course_id": row[5],
                "doj": row[6],
                "staff_id": row[7],
                "graduated_year": row[8]
            }
            alumni_list.append(alumni_details)
        return jsonify(alumni=alumni_list), 200
    except Exception as e:
        print("Error fetching alumni details:", e)
        return jsonify(error='Internal Server Error'), 500
    finally:
        cursor.close()
        db.close()



@app.route('/api/students/<int:student_id>/fees', methods=['GET'])
def get_student_fees(student_id):
    db= get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM fees WHERE student_id = ?',(student_id,))
    fees=cursor.fetchone()
    cursor.execute('SELECT doj FROM students WHERE student_id = ?',(student_id,))
    doj1=cursor.fetchone()
    doj=doj1[0]
    joining_date = datetime.strptime(doj, "%Y-%m-%d").date()
    current_date = datetime.now().date()
    inst_1 = fees[3]*0.40
    inst_2 = fees[3]*0.30
    due_2 = joining_date + timedelta(days=30)
    due_3 = joining_date + timedelta(days=60)
    fees_data=[]
    fees_data.append({
        'id': fees[0],
        'amount': fees[3],
        'paid_1st': fees[4],
        'date_1st': fees[5],
        'paid_2nd': fees[6],
        'date_2nd':fees[7],
        'paid_3rd': fees[8],
        'date_3rd':fees[9],
        'due_2': due_2,
        'due_3': due_3,
        'inst_1': inst_1,
        'inst_2': inst_2
    })
    return jsonify({'fees': fees_data[0]})  # Replace fees_data with actual data retrieved from the database

from flask import jsonify, request

def execute_query(query, args=()):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute(query, args)
    conn.commit()
    result = cursor.fetchall()
    conn.close()
    return result

@app.route('/api/staffs/<int:staff_id>/tasks', methods=['GET'])
def get_staff_tasks(staff_id):
    tasks_list = []
    query = """
            SELECT tasks.task_id, students.name, tasks.task_description, tasks.deadline, tasks.progress_date, tasks.review, tasks.file_or_link
            FROM tasks
            INNER JOIN students ON tasks.student_id = students.student_id
            WHERE tasks.staff_id = ?
            ORDER BY tasks.progress_date DESC
            """
    tasks_data = execute_query(query, (staff_id,))
    for task in tasks_data:
        tasks_list.append({
            'task_id': task[0],
            'student_name': task[1],  # Changed from 'student_id' to 'student_name'
            'task_description': task[2],
            'deadline': task[3],
            'progress_date': task[4],  # Updated index due to the removed field in the SQL query
            'review': task[5],
            'file_or_link': task[6]
        })
    return jsonify({'tasks': tasks_list})

# Route to review a task
@app.route('/api/tasks/<int:task_id>/review', methods=['PUT'])
def review_task(task_id):
    data = request.json
    review = data.get('review')
    query = "UPDATE tasks SET review = ? WHERE task_id = ?"
    execute_query(query, (review, task_id))
    return jsonify({'message': 'Task reviewed successfully'}), 200

# Route to get tasks assigned to a student
@app.route('/api/students/<int:student_id>/tasks', methods=['GET'])
def get_student_tasks(student_id):
    tasks_list = []
    query = "SELECT * FROM tasks WHERE student_id = ?"
    tasks_data = execute_query(query, (student_id,))
    for task in tasks_data:
        tasks_list.append({
            'task_id': task[0],
            'task_description': task[2],
            'deadline': task[3],
            'progress_date': task[5],
            'review': task[6],
            'file_or_link': task[7]
        })
    return jsonify({'tasks': tasks_list})

# Route to add a task for a student
@app.route('/api/students/<int:student_id>/tasks', methods=['POST'])
def add_task(student_id):
    data = request.json
    task_description = data.get('task_description')
    deadline = data.get('deadline')
    staff_id = data.get('staff_id')

    if not task_description or not deadline:
        return jsonify({'error': 'Task description and deadline are required'}), 400

    query = "INSERT INTO tasks (student_id, task_description, deadline, staff_id) VALUES (?, ?, ?, ?)"
    execute_query(query, (student_id, task_description, deadline, staff_id))

    return jsonify({'message': 'Task added successfully'}), 201

# Route to delete a task for a student
@app.route('/api/students/<int:student_id>/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(student_id, task_id):
    query = "DELETE FROM tasks WHERE student_id = ? AND task_id = ?"
    execute_query(query, (student_id, task_id))
    return jsonify({'message': 'Task deleted successfully'}), 200

# Route to handle individual task (GET, PUT, DELETE)
@app.route('/api/tasks/<int:task_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_task(task_id):
    if request.method == 'GET':
        query = "SELECT * FROM tasks WHERE task_id = ?"
        task = execute_query(query, (task_id,))
        if task:
            return jsonify({'task': dict(task[0])}), 200
        else:
            return jsonify({'error': 'Task not found'}), 404

    elif request.method == 'PUT':
        data = request.json
        task_description = data.get('task_description')
        deadline = data.get('deadline')
        staff_id = data.get('staff_id')

        if task_description is None or deadline is None or staff_id is None:
            return jsonify({'error': 'Missing required fields'}), 400

        query = "UPDATE tasks SET task_description = ?, deadline = ?, staff_id = ? WHERE task_id = ?"
        execute_query(query, (task_description, deadline, staff_id, task_id))
        return jsonify({'message': 'Task updated successfully'}), 200

    elif request.method == 'DELETE':
        query = "DELETE FROM tasks WHERE task_id = ?"
        execute_query(query, (task_id,))
        return jsonify({'message': 'Task deleted successfully'}), 200

def is_pdf(filename):
    return '.' in filename and \
    filename.rsplit('.', 1)[1].lower() in {'pdf'}
    
# Route to submit a file for a task
@app.route('/api/tasks/<int:task_id>/submit-file', methods=['POST'])
def submit_file(task_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
    task = cursor.fetchone()
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No file provided'}), 400

    submission_time = None  # Initialize submission_time

    if file and is_pdf(file.filename):
        os.makedirs(SUBMISSION_FOLDER, exist_ok=True)

        # Save the uploaded file to the destination directory
        file_path = os.path.join(SUBMISSION_FOLDER, f'{task_id}.pdf')
        file.save(file_path)
        
        submission_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Update the profile picture path in the database
        cursor.execute("UPDATE tasks SET file_or_link = ?, progress_date = ? WHERE task_id = ?", (file_path, submission_time, task_id))
        db.commit()

    if submission_time is not None:
        return jsonify({'message': 'File submitted successfully', 'submission_time': submission_time}), 200
    else:
        return jsonify({'error': 'Failed to submit file'}), 500


# Route to download a file submitted for a task
@app.route('/api/tasks/<int:task_id>/file', methods=['GET'])
def download_file(task_id):
    query = "SELECT file_or_link FROM tasks WHERE task_id = ?"
    file_path = execute_query(query, (task_id,))
    if file_path:
        file_path = file_path[0][0]
        return send_from_directory(os.path.dirname(file_path), os.path.basename(file_path))
    else:
        return jsonify({'error': 'File not found'}), 404
    
@app.route('/submit/<path:filename>')
def submitted(filename):
    return send_from_directory(os.path.join(app.root_path, 'submit'), filename)

@app.route('/api/staff_progress', methods=['GET'])
def get_staff_progress():
        conn = get_db()
        cursor = conn.cursor()

        # Query to fetch progress data along with staff and course details
        query = """
            SELECT sp.date, s.name, c.course_name, sp.progress
            FROM staff_progress sp
            JOIN staffs s ON sp.staff_id = s.staff_id
            JOIN courses c ON sp.course_id = c.course_id
            ORDER BY sp.date DESC
        """
        cursor.execute(query)
        progress_data = cursor.fetchall()

        # Constructing response data
        progress_list = []
        for progress in progress_data:
            progress_dict = {
                'date': progress[0],
                'staff_name': progress[1],
                'course_name': progress[2],
                'progress': progress[3]
            }
            progress_list.append(progress_dict)

        conn.close()

        return jsonify({'progress': progress_list}), 200

@app.route('/api/staff_progress/<int:staff_id>', methods=['GET'])
def get_staff_progress_staff(staff_id):
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sp.date, s.name, c.course_name, sp.progress
            FROM staff_progress sp
            JOIN staffs s ON sp.staff_id = s.staff_id
            JOIN courses c ON sp.course_id = c.course_id
            WHERE sp.staff_id = ?
            ORDER BY sp.date DESC
        """, (staff_id,))
        progress_data = cursor.fetchall()

        # Constructing response data
        progress_list = []
        for progress in progress_data:
            progress_dict = {
                'date': progress[0],
                'staff_name': progress[1],
                'course_name': progress[2],
                'progress': progress[3]
            }
            progress_list.append(progress_dict)

        conn.close()

        return jsonify({'progress': progress_list}), 200

@app.route('/api/staff_progress', methods=['POST'])
def insert_staff_progress():
    data = request.json
    print(data)
    staff_id = data['staff_id']
    course_id = data['course_id']
    progress = data['progress']
        # Insert data into the staff_progress table
    date = datetime.now().strftime("%Y-%m-%d")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
            INSERT INTO staff_progress (date, staff_id, course_id, progress)
            VALUES (?,?,?,?)
        """, (date, staff_id, course_id, progress))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Staff progress inserted successfully'}), 200
    

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    # Get filter parameters from the query string
    student_id = request.args.get('student_id')
    date = request.args.get('date')
    course_id = request.args.get('course_id')
    
    # Start building the SQL query
    query = """
        SELECT a.*, s.name AS student_name, c.course_name
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        JOIN courses c ON s.course_id = c.course_id
        WHERE 1
    """

    # Check if student_id filter is provided
    if student_id:
        query += f" AND s.student_id = {student_id}"

    if course_id:
        query += f" AND c.course_id = {course_id}"

    # Check if date filter is provided
    if date:
        query += f" AND date = '{date}'"

    # Use the context manager to get the cursor within the database connection
    with get_db() as db:
        cursor = db.cursor()
        # Execute the final query
        cursor.execute(query)
        attendance = cursor.fetchall()
        
    cursor.execute('''
            SELECT COUNT(*) FROM attendance
            WHERE student_id = ? AND is_present = 1
        ''', (student_id,))
    present_count = cursor.fetchone()[0]

    cursor.execute('''
            SELECT COUNT(*) FROM attendance
            WHERE student_id = ?
        ''', (student_id,))
    total_count = cursor.fetchone()[0]

    attendance_percentage = (present_count / total_count) * 100 if total_count > 0 else 0
    return jsonify({'attendance': attendance,'attendancePercentage':attendance_percentage})
    
@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    student_id = data.get('student_id')
    is_present = data.get('is_present')
    date_str = data.get('date')

    if not student_id or is_present is None:
        return jsonify({'error': 'Invalid request'}), 400

    # Use the provided date or default to the current date
    date = date_str or datetime.now().strftime("%Y-%m-%d")

    # Use the context manager to get the cursor within the database connection
    with get_db() as db:
        cursor = db.cursor()

        # Insert or replace the attendance record
        cursor.execute('INSERT OR REPLACE INTO attendance (student_id, is_present, date) VALUES (?, ?, ?)',
                       (student_id, is_present, date))
        db.commit()

        return jsonify({'message': 'Attendance marked successfully'}), 201

@app.route('/api/staffattendance', methods=['POST'])
def mark_staff_attendance():
    data = request.get_json()
    staff_id = data.get('staff_id')
    is_present = data.get('is_present')
    date_str = data.get('date')

    if not staff_id or is_present is None:
        return jsonify({'error': 'Invalid request'}), 400

    date = date_str or datetime.now().strftime("%Y-%m-%d")

    with get_db() as db:
        cursor = db.cursor()

        cursor.execute('INSERT OR REPLACE INTO staffattendance (staff_id, is_present, date) VALUES (?, ?, ?)',
                       (staff_id, is_present, date))
        db.commit()

        return jsonify({'message': 'Attendance marked successfully'}), 201

@app.route('/api/attendance/<int:record_id>', methods=['PUT'])
def update_attendance(record_id):
    data = request.get_json()
    is_present = data.get('is_present')

    # Check if is_present field is provided and valid
    if is_present is None or is_present not in (0, 1):
        return jsonify({'error': 'Invalid is_present value'}), 400

    try:
        # Connect to the database
        connection = get_db()
        cursor = connection.cursor()

        # Update the attendance record with the new is_present value
        cursor.execute('UPDATE attendance SET is_present = ? WHERE id = ?', (is_present, record_id))
        connection.commit()
        connection.close()

        return jsonify({'message': 'Attendance record updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update attendance record: {str(e)}'}), 500

@app.route('/api/staffattendance', methods=['GET'])
def get_staff_attendance():
    staff_id = request.args.get('staff_id')
    date = request.args.get('date')
    
    query = """
        SELECT sa.*, s.name AS staff_name
        FROM staffattendance sa
        JOIN staffs s ON sa.staff_id = s.staff_id
        WHERE 1=1
    """
    
    params = []

    if staff_id:
        query += " AND sa.staff_id = ?"
        params.append(staff_id)

    if date:
        query += " AND date = ?"
        params.append(date)

    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(query, params)  # Execute the query with parameters
        attendance = cursor.fetchall()

        if attendance:  # Check if attendance data is available
            present_count = 0
            total_count = len(attendance)
            
            for record in attendance:
                if record[3] == 1:  # Accessing is_present using integer index
                    present_count += 1

            attendance_percentage = (present_count / total_count) * 100 if total_count > 0 else 0
        else:
            present_count = 0
            total_count = 0
            attendance_percentage = 0
    return jsonify({'attendance': attendance, 'attendancePercentage': attendance_percentage})

@app.route('/api/staffattendance/<int:record_id>', methods=['PUT'])
def update_staff_attendance(record_id):
    data = request.get_json()
    is_present = data.get('is_present')

    if is_present is None or is_present not in (0, 1):
        return jsonify({'error': 'Invalid is_present value'}), 400

    try:
        connection = get_db()
        cursor = connection.cursor()

        cursor.execute('UPDATE staffattendance SET is_present = ? WHERE id = ?', (is_present, record_id))
        connection.commit()
        connection.close()

        return jsonify({'message': 'Attendance record updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update attendance record: {str(e)}'}), 500

@app.route('/api/update-installments', methods=['POST'])
def update_installments():
    data = request.get_json()
    student_id = data.get('student_id')
    installment= data.get('installment')
    date=data.get('date')

    if not student_id:
        return jsonify({'error': 'Invalid request data'}), 400

    db = get_db()
    cursor = db.cursor()

    try:
        # Update the installment status and payment date for each installment
            # Construct the column names dynamically based on the installment number
        paid_column = f'paid_{installment.lower()}'
        date_column = f'date_{installment.lower()}'

            # Update the corresponding fields in the fees table
        cursor.execute(f"UPDATE fees SET {paid_column} = ?, {date_column} = ? WHERE student_id = ?",
                           (1, date, student_id))

        db.commit()
        return jsonify({'message': 'Installments updated successfully'})
    except Exception as e:
        return jsonify({'error': f'Error updating installments: {str(e)}'}), 500

@app.route('/api/fees', methods=['GET'])
def get_fees():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM fees')
    fees_data = cursor.fetchall()
    
    fees_list = []
    for fee in fees_data:
        fees_list.append({
            'fee_id': fee[0],
            'student_id': fee[1],
            'course_id': fee[2],
            'fee_amount': fee[3],
            'paid_1st': fee[4],
            'date_1st': fee[5],
            'paid_2nd': fee[6],
            'date_2nd': fee[7],
            'paid_3rd': fee[8],
            'date_3rd': fee[9],
        })
    
    return jsonify({'fees': fees_list})


@app.route('/api/students/<int:student_id>/progress', methods=['POST'])
def create_progress(student_id):
    db = get_db()
    cursor = db.cursor()

    # Extract data from the request
    data = request.json
    task_description = data.get('task_description')
    progress_date = data.get('progress_date')
    staff_id = data.get('staff_id')
    review = data.get('review')
    file_or_link = data.get('file_or_link')

    # Convert progress_date to a datetime object
    progress_date = datetime.strptime(progress_date, "%Y-%m-%d").date()

    # Insert the progress record into the database
    cursor.execute("""
        INSERT INTO progress (student_id, task_description, progress_date, staff_id, review, file_or_link)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (student_id, task_description, progress_date, staff_id, review, file_or_link))
    db.commit()

    return jsonify({'message': 'Progress record created successfully'}), 201

# Route to update an existing progress record for a student
@app.route('/api/students/<int:student_id>/progress/<int:progress_id>', methods=['PUT'])
def update_progress(student_id, progress_id):
    db = get_db()
    cursor = db.cursor()

    # Extract data from the request
    data = request.json
    task_description = data.get('task_description')
    progress_date = data.get('progress_date')
    staff_id = data.get('staff_id')
    review = data.get('review')
    file_or_link = data.get('file_or_link')

    # Convert progress_date to a datetime object
    progress_date = datetime.strptime(progress_date, "%Y-%m-%d").date()

    # Update the progress record in the database
    cursor.execute("""
        UPDATE progress
        SET task_description=?, progress_date=?, staff_id=?, review=?, file_or_link=?
        WHERE student_id=? AND progress_id=?
    """, (task_description, progress_date, staff_id, review, file_or_link, student_id, progress_id))
    db.commit()

    return jsonify({'message': 'Progress record updated successfully'}), 200

# Route to delete an existing progress record for a student
@app.route('/api/students/<int:student_id>/progress/<int:progress_id>', methods=['DELETE'])
def delete_progress(student_id, progress_id):
    db = get_db()
    cursor = db.cursor()

    # Delete the progress record from the database
    cursor.execute("""
        DELETE FROM progress
        WHERE student_id=? AND progress_id=?
    """, (student_id, progress_id))
    db.commit()

    return jsonify({'message': 'Progress record deleted successfully'}), 200

# Route to retrieve all progress records for a student
@app.route('/api/students/<int:student_id>/progress', methods=['GET'])
def get_student_progress(student_id):
    db = get_db()
    cursor = db.cursor()

    # Retrieve all progress records for the student from the database
    cursor.execute("""
        SELECT * FROM progress
        WHERE student_id=?
    """, (student_id,))
    progress_records = cursor.fetchall()

    # Convert progress records to a list of dictionaries
    progress_list = []
    for record in progress_records:
        progress_list.append(dict(record))

    return jsonify({'progress': progress_list}), 200

@app.route('/api/query', methods=['POST'])
def post_query():
    data = request.get_json()
    user_id = data.get('user_id')
    query_text = data.get('query_text')

    if not user_id or not query_text:
        return jsonify({'error': 'User ID and query text are required'}), 400

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute('INSERT INTO queries (user_id, query_text) VALUES (?, ?)', (user_id, query_text))
        db.commit()
        return jsonify({'message': 'Query posted successfully'}), 201
    except Exception as e:
        return jsonify({'error': f'Error posting query: {str(e)}'}), 500

@app.route('/api/queries', methods=['GET'])
def get_queries():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM queries')
    queries = cursor.fetchall()

    query_list = []
    for query in queries:
        query_list.append({
            'id': query[0],
            'user_id': query[1],
            'query_text': query[2],
            'resolution_text': query[3],
            'status': query[4],
            'created_at': query[5],
            'resolved_at': query[6]
        })

    return jsonify({'queries': query_list})

@app.route('/api/query/<int:query_id>/resolve', methods=['PUT'])
def resolve_query(query_id):
    data = request.get_json()
    resolution_text = data.get('resolution_text')

    if not resolution_text:
        return jsonify({'error': 'Resolution text is required'}), 400

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute('UPDATE queries SET resolution_text=?, status="Resolved", resolved_at=CURRENT_TIMESTAMP WHERE id=?',
                       (resolution_text, query_id))
        db.commit()
        return jsonify({'message': 'Query resolved successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error resolving query: {str(e)}'}), 500
    
# Endpoint to get messages
@app.route("/api/messages", methods=["GET"])
def get_messages():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT messages.user_id, messages.message, messages.timestamp, users.name, users.role FROM messages JOIN users ON users.id = messages.user_id ORDER BY messages.timestamp")
    messages = cursor.fetchall()
    if messages:
        return jsonify({"messages": messages})
    return jsonify({"error": f"Error fetching messages:"}), 500

# Endpoint to submit a new message
@app.route("/api/messages", methods=["POST"])
def add_message():
    try:
        data = request.json
        user_id = data.get("user_id")
        message = data.get("message")

        if not user_id or not message:
            return jsonify({"error": "User ID and message are required fields"}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute("INSERT INTO messages (user_id, message) VALUES (?, ?)", (user_id, message))
        db.commit()

        return jsonify({"message": "Message submitted successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Error submitting message: {str(e)}"}), 500

@app.route('/api/questions', methods=['GET'])
def get_questions():
    try:
        student_id = request.args.get('student_id')
        # Fetch course_id and assignment details from the database (replace with your database query)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT course_id, difficulty, num_questions FROM mcq_assignments WHERE student_id = ?', (student_id,))
        assignment_details = cursor.fetchone()
        course_id, difficulty, num_questions = assignment_details[0], assignment_details[1], assignment_details[2]
        # Fetch questions based on assignment details
        cursor.execute('SELECT * FROM questions WHERE course_id = ? AND difficulty = ? ORDER BY RANDOM() LIMIT ?', (course_id, difficulty, num_questions))      
        queries = cursor.fetchall()
        query_list = []
        for query in queries:
            query_list.append({
                'id': query[0],
                'question': query[2],
                'option1': query[3],
                'option2': query[4],
                'option3': query[5],
                'option4': query[6],
                'correct_option': query[7],
                'difficulty': query[8]
            })
        return jsonify({'questions': query_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/questions/<int:course_id>', methods=['GET'])
def get_questions_course(course_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM questions WHERE course_id = ?', (course_id,))
        questions = cursor.fetchall()
        conn.close()
        return jsonify({'questions': questions}), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500


@app.route('/api/student_tests', methods=['POST'])
def submit_test():
    try:
        data = request.json
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO student_tests (student_id, course_id, responses) VALUES (?, ?, ?)', (data['student_id'], data['course_id'], data['responses']))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Test submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scores/<int:student_id>', methods=['GET'])
def get_student_score(student_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT score FROM student_scores WHERE student_id = ?', (student_id,))
        score = cursor.fetchone()
        conn.close()
        return jsonify({'score': score}), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions', methods=['POST'])
def create_question():
    conn = get_db()
    cursor = conn.cursor()
    data = request.json
    staff_id = data['staff_id']
    cursor.execute("SELECT courses.course_id FROM staffs INNER JOIN courses ON staffs.staff_id = courses.staff_id WHERE staffs.staff_id = ?", (staff_id,))
    course_id = cursor.fetchone()[0]
    cursor.execute('''
            INSERT INTO questions (course_id, question, option1, option2, option3, option4, correct_option, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            course_id,
            data['question'],
            data['option1'],
            data['option2'],
            data['option3'],
            data['option4'],
            data['correct_option'],
            data['difficulty']
        ))
    conn.commit()
    return jsonify({'message': 'Question created successfully'}), 201


@app.route('/api/questions/<int:id>', methods=['DELETE'])
def delete_question(id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM questions WHERE id = ?', (id,))
        conn.commit()
        return jsonify({'message': 'Question deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assignments', methods=['POST'])
def assign_mcq_test():
    try:
        data = request.json
        student_ids = data.get('student_ids')
        course_id = data.get('course_id')
        deadline = data.get('deadline')
        difficulty = data.get('difficulty')
        num_questions = data.get('num_questions')

        # Convert deadline to datetime object
        deadline = datetime.strptime(deadline, '%Y-%m-%dT%H:%M')

        # Insert assignment into the database for each student
        conn = get_db()
        cursor = conn.cursor()
        for student_id in student_ids:
            cursor.execute('INSERT INTO mcq_assignments (student_id, course_id, deadline, difficulty, num_questions) VALUES (?, ?, ?, ?, ?)',
                           (student_id, course_id, deadline, difficulty, num_questions))
        conn.commit()
        conn.close()

        return jsonify({'message': 'MCQ test assigned successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
             
@app.route('/api/scores', methods=['POST'])
def store_score():
    try:
        data = request.json
        student_id = data.get('student_id')
        score = data.get('score')
        completion_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Check if the student_id exists in the scores table
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM scores WHERE student_id = ?', (student_id,))
        existing_record = cursor.fetchone()

        if existing_record:
            # If the record exists, update it
            cursor.execute('UPDATE scores SET score = ?, date = ? WHERE student_id = ?', (score, completion_datetime, student_id))
        else:
            # If the record does not exist, insert a new one
            cursor.execute('INSERT INTO scores (student_id, score, date) VALUES (?, ?, ?)', (student_id, score, completion_datetime))

        conn.commit()
        conn.close()

        return jsonify({'message': 'Score stored successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route('/api/mcq_assignments/<int:student_id>', methods=['DELETE'])
def delete_mcq_assignment(student_id):
        # Connect to the SQLite database
        conn = get_db()
        cursor = conn.cursor()

        # Execute the SQL query to delete the record with the given student_id
        cursor.execute("DELETE FROM mcq_assignments WHERE student_id = ?", (student_id,))

        # Commit the changes to the database
        conn.commit()

        # Close the cursor and connection
        cursor.close()
        conn.close()

        return jsonify({'message': 'MCQ assignment record deleted successfully'}), 200
    
@app.route('/api/add_connection', methods=['POST'])
def add_connection():
    data = request.get_json()
    date = data.get('date')
    name = data.get('name')
    phone_number = data.get('phone_number')
    email = data.get('email')
    interest = data.get('interest')
    source = data.get('source')
    lead_stage = data.get('lead_stage')
    lead_status = data.get('lead_status')
    course = data.get('course')
    message = data.get('comments')

    if not date or not name or not phone_number or not email:
        return jsonify({'error': 'Invalid request. Date, name, phone number, and email are required.'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO connections (date, name, phone_number, email, interest, source, lead_stage, lead_status, course_id, messages)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (date, name, phone_number, email, interest, source, lead_stage, lead_status, course, message))

        conn.commit()
        conn.close()

        return jsonify({'message': 'External connection added successfully'}), 201
    except Exception as e:
        return jsonify({'message':'Check if the phone number or email existst already','error': f'Failed to add external connection: {str(e)}'}), 500

@app.route('/api/connections', methods=['GET'])
def get_connections():
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute('SELECT connections.*, courses.course_name FROM connections JOIN courses ON connections.course_id = courses.course_id')
        connections = cursor.fetchall()
        conn_list = []
        for conn in connections:
            conn_list.append({
                'id': conn[0],
                'date': conn[1],
                'name': conn[2],
                'phone_number': conn[3],
                'email': conn[4],
                'course': conn[11],
                'interest': conn[5],
                'source': conn[6],
                'lead_stage': conn[7],
                'lead_status': conn[8],
                'message': conn[10]
            })
        db.close()
        return jsonify({'connections': conn_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/connections/<int:id>', methods=['PUT'])
def update_connection(id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided for update'}), 400

        conn = get_db()
        cursor = conn.cursor()

        # Construct SQL update query
        update_query = 'UPDATE connections SET '
        update_values = []
        for key, value in data.items():
            update_values.append(f"{key} = '{value}'")
        update_query += ', '.join(update_values)
        update_query += f" WHERE id = {id}"

        cursor.execute(update_query)
        conn.commit()

        # Check if any rows were updated
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Connection not found'}), 404

        conn.close()
        return jsonify({'message': 'Connection updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__':
    create_tables()
    app.run(port=8000, debug=True)
