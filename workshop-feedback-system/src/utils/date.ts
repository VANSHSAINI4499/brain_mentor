export function normalizeDate(dateValue: any): Date {
  if (!dateValue) {
    return new Date();
  }

  // Handle Firestore Timestamp objects which have a toDate() method
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }

  // Handle raw objects with 'seconds' that might be serialized Timestamps
  if (typeof dateValue === 'object' && 'seconds' in dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000);
  }

  // Handle existing Date objects, ISO strings, or timestamps
  const parsedDate = new Date(dateValue);
  
  // Fallback if parsing results in an Invalid Date
  if (isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

export function formatDate(dateValue: any, options?: Intl.DateTimeFormatOptions): string {
  const date = normalizeDate(dateValue);
  
  if (!options) {
    return date.toLocaleDateString('en-US');
  }
  
  return date.toLocaleDateString('en-US', options);
}

export function formatDateTime(dateValue: any, options?: Intl.DateTimeFormatOptions): string {
  const date = normalizeDate(dateValue);
  
  if (!options) {
    return date.toLocaleString('en-US');
  }
  
  return date.toLocaleString('en-US', options);
}
