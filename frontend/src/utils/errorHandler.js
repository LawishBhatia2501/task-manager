export const handleApiError = (error) => {
  if (error.response) {
    
    const { type, message } = error.response.data.error || {};
    
    switch (error.response.status) {
      case 400:
        return { 
          type: 'validation', 
          message: message || 'Invalid input. Please check your data.' 
        };
      case 401:
        return { 
          type: 'auth', 
          message: 'Please log in again' 
        };
      case 403:
        return { 
          type: 'permission', 
          message: message || 'You do not have permission to perform this action' 
        };
      case 404:
        return { 
          type: 'notFound', 
          message: message || 'Resource not found' 
        };
      case 409:
        return { 
          type: 'conflict', 
          message: message || 'This resource already exists' 
        };
      case 500:
        return { 
          type: 'server', 
          message: 'Server error. Please try again later' 
        };
      default:
        return { 
          type: 'unknown', 
          message: message || 'An error occurred' 
        };
    }
  } else if (error.request) {
    
    return { 
      type: 'network', 
      message: 'Network error. Please check your connection' 
    };
  } else {
    
    return { 
      type: 'client', 
      message: error.message || 'An error occurred' 
    };
  }
};