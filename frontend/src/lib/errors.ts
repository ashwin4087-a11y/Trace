export function errorText(error: unknown): string {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as any).response;
    const msg = response?.data?.error?.message;
    const details = response?.data?.error?.details;
    
    // Check if it's a validation error with field details
    if (msg === "Request validation failed" && details && details.fieldErrors) {
      const field = Object.keys(details.fieldErrors)[0];
      if (field && details.fieldErrors[field].length > 0) {
        return `${field.replace("body.", "")}: ${details.fieldErrors[field][0]}`;
      }
    }
    
    return msg ?? "Request failed";
  }
  return "Request failed";
}
