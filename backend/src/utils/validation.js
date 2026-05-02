const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (typeof password !== 'string') return false;
  return password.length >= 8;
};

const validateNonEmptyString = (str) => {
  if (typeof str !== 'string') return false;
  return str.trim().length > 0;
};

const validateDate = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  
  
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!iso8601Regex.test(dateStr)) return false;
  
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

const validatePriority = (priority) => {
  const validPriorities = ['Low', 'Medium', 'High'];
  return validPriorities.includes(priority);
};

const validateStatus = (status) => {
  const validStatuses = ['To Do', 'In Progress', 'Done'];
  return validStatuses.includes(status);
};

const sanitizeInput = (input) => {
  
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const sanitized = {};
    for (const key in input) {
      
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  
  return input;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateNonEmptyString,
  validateDate,
  validatePriority,
  validateStatus,
  sanitizeInput
};