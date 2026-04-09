const { google } = require('googleapis');

/**
 * Server-side function to create a Google Meet link.
 * This assumes you have initialized an OAuth2 client with valid credentials.
 */
const createMeeting = async (req, res) => {
  const { timeSlot, userEmails } = req.body;

  // Basic validation
  if (!timeSlot || !userEmails || userEmails.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: timeSlot or userEmails' });
  }

  try {
    // Setup OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // NOTE: In a real integration, you must manage user tokens (access_token/refresh_token) 
    // in your database and set them here.
    // oauth2Client.setCredentials({ refresh_token: process.env.USER_REFRESH_TOKEN });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 1-hour meeting duration
    const startTime = new Date(timeSlot);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: 'SkillSwap Peer-to-Peer Session',
      description: 'A scheduled skill exchange session via SkillSwap.',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: userEmails.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `skillswap-meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    // Insert the event into the user's primary calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1, // Must be 1 to generate Google Meet link
      sendUpdates: 'all', // Send email invitations to attendees
    });

    const meetLink = response.data.hangoutLink;

    if (meetLink) {
      return res.status(200).json({ 
        message: 'Meeting created successfully', 
        meetLink, 
        eventId: response.data.id 
      });
    } else {
      throw new Error('Failed to generate Hangout Meet Link');
    }

  } catch (error) {
    console.error('Error creating Google Event:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

module.exports = {
  createMeeting
};
