# GetPay  - Payment Management System

A comprehensive payment management system for Colleges,educational institutions, Restaurents, Hotels, and every where you need to track you payment and provide a receipt to user 
with real-time payment tracking, admin dashboard, and Razorpay integration.

## 📸 Dashboard Previews

### Admin Dashboard
![Admin Dashboard](Admin%20Dashboard.png)

### Student Dashboard  
![Student Dashboard](Student%20Dashboard.png)

## 🚀 Features

### Admin Payment Management Dashboard
- **Real-time Payment Overview**: Live statistics showing total received, pending, and failed payments
- **Payment Statistics**: Monthly trends and percentage changes
- **Advanced Filtering**: Filter by class, status, date range, and search functionality
- **Class-based Filtering**: View payments by specific student classes (e.g., 12thA, 11thB)
- **Real-time Updates**: Automatic refresh every 30 seconds with new payment notifications
- **Export Functionality**: Export payment data to CSV format
- **Payment Details Modal**: Detailed view of each payment with Razorpay transaction IDs

### Payment Tracking
- **Razorpay Integration**: Complete payment gateway integration with transaction IDs
- **Payment Status Tracking**: Real-time status updates (completed, pending, failed)
- **Receipt Generation**: Automatic PDF receipt generation and email delivery
- **Payment History**: Complete payment history for each student

### Student Management
- **Class-based Organization**: Students organized by classes (12thA, 12thB, etc.)
- **Fee Assignment**: Assign different fee types to students
- **Payment Notifications**: Email notifications for successful payments

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Razorpay** payment gateway integration
- **JWT** authentication
- **PDF generation** for receipts
- **Email service** for notifications

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Icons** for UI icons
- **Real-time updates** with polling
- **Responsive design** for all devices

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Razorpay account
- SMTP email service

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GetPay
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   PORT=5000
   ```

5. **Seed the database**
   ```bash
   cd backend
   node seed.js
   ```

6. **Start the servers**
   
   Backend:
   ```bash
   cd backend
   npm start
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## 📊 Database Schema

### Student Model
```javascript
{
  name: String,
  email: String,
  registrationNo: String,
  password: String,
  role: String,
  className: String
}
```

### Payment Model
```javascript
{
  studentId: ObjectId,
  assignmentId: ObjectId,
  amount: Number,
  mode: String,
  status: String,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String
}
```

### Fee Model
```javascript
{
  title: String,
  amount: Number,
  category: String,
  dueDate: Date
}
```

## 🔌 API Endpoints

### Admin Payment Management
- `GET /api/admin/payments` - Get all payments with filters
- `GET /api/admin/payments/stats` - Get payment statistics
- `GET /api/admin/payments/:id` - Get payment details
- `GET /api/admin/payments/recent` - Get recent payments
- `GET /api/admin/classes` - Get all class names

### Payment Processing
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 🎯 Key Features Implementation

### 1. Real-time Payment Updates
- Polling mechanism updates payment data every 30 seconds
- New payment notifications appear automatically
- Live statistics updates

### 2. Class-based Filtering
- Dropdown to select specific classes (12thA, 12thB, etc.)
- Filtered view shows only payments from selected class
- Statistics update based on selected filters

### 3. Razorpay Transaction Tracking
- Complete Razorpay integration
- Transaction IDs stored and displayed
- Payment verification with signature validation

### 4. Advanced Search & Filtering
- Search by student name, registration number, or transaction ID
- Filter by payment status (completed, pending, failed)
- Date range filtering
- Multiple filter combinations

### 5. Export Functionality
- Export filtered payment data to CSV
- Includes all payment details and transaction IDs
- Downloadable reports for accounting

## 🎨 UI/UX Features

### Payment Overview Cards
- **Total Received**: Green gradient with percentage change
- **Pending**: Yellow gradient with payment count
- **Failed**: Red gradient with payment count

### Interactive Table
- Sortable columns
- Hover effects
- Status indicators with colored dots
- Clickable payment IDs for details

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts
- Touch-friendly controls

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Protected admin routes
- Input validation and sanitization
- Secure payment verification

## 📱 Usage

### Admin Login
1. Navigate to the admin panel
2. Login with admin credentials
3. Access the payment management dashboard

### Viewing Payments
1. All payments are displayed in the main table
2. Use filters to narrow down results
3. Click "Details" to view complete payment information
4. Export data using the export button

### Real-time Monitoring
1. Dashboard automatically updates every 30 seconds
2. New payments trigger notifications
3. Statistics update in real-time
4. Payment status changes are reflected immediately

## 🧪 Testing

Run the test suite:
```bash
cd backend
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact to rajatsinghtomarofficial@gmail.com.

---

**GetPay** - Streamlining payment management for educational institutions, Restaurants, Hotels, and for Commercials usage. 
looking for peoples who can suggest me to improve UI/UX 
