/**
 * Generates and downloads an .ics file for a given event.
 */
export const downloadICS = (event) => {
  const { title, description, startTime, endTime, location } = event;

  // Format date to YYYYMMDDTHHMMSSZ
  const formatDate = (date) => {
    return new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkillSwap//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `LOCATION:${location || "Online"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
