export const formatDate = (date: Date) => {
  const formattedDate = date.toLocaleString('en-US', {
    month: 'long', // "February"
    day: '2-digit', // "19"
    year: 'numeric', // "2024"
    // hour: 'numeric', // "10"
    // minute: '2-digit', // "04"
    // hour12: true // AM/PM format
  })
  return formattedDate
}
