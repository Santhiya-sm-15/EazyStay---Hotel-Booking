EazyStay – Hotel Booking System

Project Overview

EazyStay is a hotel booking management system that allows users to easily search, book, and manage hotel rooms online. The system also provides an admin dashboard for managing rooms, bookings, and customer feedback.

The application includes features like user authentication, booking validation, profile management, invoice generation, and feedback submission, making it a complete solution for hotel reservation management.

Features

User Features

- User authentication (Sign up, Login, Logout)
- Profile management (update personal details, change password)
- Room booking with date & availability validation
- Booking history with invoice download (PDF)
- Feedback submission linked to booking ID
- Password recovery (Forgot & Reset Password)

Admin Features

- Add, edit, and remove rooms
- Manage room availability and bookings
- View customer feedback reports
- Admin dashboard with analytics

Usage Guide

1 Register & Login
    - New users can sign up, and existing users can log in securely.

2 Search & Book Rooms
    - Select check-in/check-out dates and book available rooms.

3 Profile Management
    - Update personal details and manage your account from the profile page.

4 View & Manage Bookings
    - Check booking history, cancel bookings, or download invoices.

5 Give Feedback
   - Provide feedback linked with your booking ID for better services.

6 Admin Dashboard
    - Admins can manage rooms, monitor bookings, and analyze reports.

Folder Structure

eazystay-hotel-booking/
│── index.html
│── index.js
│── db.json
│
├── auth/
│   ├── login.js
|   |── login.html
|   |── signup.html
│   ├── signup.js
|   |── forget_password.html
|   |── forget_password.js
|   |── reset_password.html
│   ├── reset_password.js
│
├── dashboard/
|   |──AdminDashboard/
|   |    ├── dashboard/
|   |    │   ├── dashboard.html
|   |    │   ├── dashboard.js
|   |    │
|   |    ├── sidebar/
|   |    │   ├── sidebar.js
|   |    │
|   |    ├── bookingManagement/
|   |    │   ├── bookingManagement.html
|   |    │   ├── bookingManagement.js
|   |    │
|   |    ├── roomManagement/
|   |    │   ├── roomManagement.html
|   |    │   ├── roomManagement.js
|   |    │
|   |    ├── userManagement/
|   |    │   ├── userManagement.html
|   |    │   ├── userManagement.js
|   |    │
|   |    ├── contentManagement/
|   |    |   ├── contentManagement.html
|   |    │   ├── contentManagement.js
|   |    │
|   |    ├── feedbackManagement/
|   |    │   ├── feedbackManagement.html
|   |    │   ├── feedbackManagement.js
|   |    │
|   |    ├── notificationManagement/
|   |    │   ├── notificationManagement.html
|   |    │   ├── notificationManagement.js
|   |    │
|   |    ├── profile/                  
|   |    │   ├── profile.html
|   |    │   ├── profile.js
|   |    │
|   |    ├── reportManagement/
|   |    │   ├── reportManagement.html
|   |    │   ├── reportManagement.js
|   |    │
|   |    ├── backupRestore/
|   |    │   ├── backupRestore.html
|   |    │   ├── backupRestore.js
|   │
│   ├── UserDashboard/
│   │   ├── profile/
│   │   │   ├── profile.html
│   │   │   ├── profile.js
│   │   ├── bookings/
│   │   │   ├── bookings.html
│   │   │   ├── bookings.js
│   │   ├── account/
│   │       ├── account.html
│   │       ├── account.js
│
├── booking/                
│   ├── viewrooms/
│   │   ├── viewrooms.html
│   │   ├── viewrooms.js
│   ├── bookingForm/
│   │   ├── bookingForm.html
│   │   ├── bookingForm.js
│
├── payment/                 
│   ├── pay.html
│   ├── pay.js
│   ├── paymentSuccess.html
│   ├── paymentSuccess.js
│


Author
- Santhiya S
- santhiyasm15@gmail.com