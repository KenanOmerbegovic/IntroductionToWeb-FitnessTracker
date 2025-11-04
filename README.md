# FitnessTracker - Milestone 1 Completion

## Milestone 1: Static Frontend Development

### 1. Project Structure (1pt)

Backend Structure
- backend
- routes
- services
- dao
- config

Frontend Structure
Assets
- css
- - style.css
- js
- - custom.js # Application initialization
- - workout.js(to be used later)
- - auth.js (to be used later)
- Views
- - dashboard.html
- - profile.html
- - login.html
- - admin-panel.html
- - register.html
- - exercise-library.html
- - progress-charts.html
- - workout-history.html
- - workout-log
- index.html # Main SPA container

### 2. Static Frontend (3pts)

- **dashboard.html** -> Landing Page
- **progress-charts.html** -> showing progress in in number of sets and weight used
- **exercise-library.html** -> list of exercises sorted by body regions
- **login.html** -> Account login
- **register.html** -> Account Creatiom 
- **profile.html** -> User Account Managment
- **workout-history.html** -> looking back at previous workouts
- **admin-panel.html** -> Admin Control Dashboard
- **index.html** -> Main SPA Container with Footer and Header

### 3. Database Schema (Planning Only) (1pt)

![Database Schema](./frontend/assets/Database-schema.png)

## Milestone 2: Backend Setup and CRUD Operations for Initial Entities

### 1. Database Creation  (1pt)
- sql file containing all tables and test data 
- stored in the main folder with the frontend and backend folders


### 2. DAO Layer (4pts)

- **config.php**
- **BaseDao.php**
- **ExerciseCategoryDao.php**
- **ExerciseDao.php**
- **PersonalRecordDao.php**
- **UserDao.php**
- **WorkoutDao.php**
- **WorkoutExerciseDao.php**