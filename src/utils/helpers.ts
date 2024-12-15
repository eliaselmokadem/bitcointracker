export const getPercentageColor = (percentage: number): string => {
  return percentage >= 0 ? "#4CAF50" : "#FF4444";
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const [month, day, year] = dateString.split("/");
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
