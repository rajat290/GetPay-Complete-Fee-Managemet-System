/**
 * Utility to validate Student CSV data
 * Expected Headers: Name, Email, Registration No, Class
 */
const validateStudentCSV = (data) => {
  const errors = [];
  const requiredFields = ['Name', 'Email', 'Registration No', 'Class'];
  
  // Check headers
  const headers = Object.keys(data);
  const missingHeaders = requiredFields.filter(f => !headers.includes(f));
  
  if (missingHeaders.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required columns: ${missingHeaders.join(', ')}` 
    };
  }

  // Basic Row Validation
  if (!data.Name || data.Name.trim().length < 2) {
    errors.push("Name is too short or missing");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.Email || !emailRegex.test(data.Email)) {
    errors.push(`Invalid email format: ${data.Email}`);
  }

  if (!data['Registration No'] || data['Registration No'].trim().length < 3) {
    errors.push("Registration No is required and must be at least 3 characters");
  }

  if (!data.Class || data.Class.trim().length === 0) {
    errors.push("Class is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateStudentCSV
};
