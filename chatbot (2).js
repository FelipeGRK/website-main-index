// Hamburger Toggle Code
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active'); // Toggle "active" to show/hide nav on mobile
  });
});


let conversationState = {
  askingCollege: false,
  askingMajor: false,
  lastIntent: null
};

let tempData = {
  college: "",
  major: "",
  collegeConfirmed: false
};

async function sendMessage(question = '') {
  const userInput = document.getElementById('userInput');
  const chatbox = document.getElementById('chatbox');
  const userMessage = question || userInput.value.trim();
  if (userMessage === '') return;

  chatbox.innerHTML += `<div class="message user-message"><p><strong>🧑‍🎓 You:</strong> ${userMessage}</p></div>`;
  userInput.value = '';

  chatbox.innerHTML += `<div class="message bot-message typing"><p>🎮 Esports Assistant is typing...</p></div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  const lowerMessage = userMessage.toLowerCase();

  if (conversationState.askingCollege) {
    tempData.college = userMessage;
    conversationState.askingCollege = false;

    if (conversationState.lastIntent === "findCoach") {
      const reply = await findCoachContact(tempData.college);
      document.querySelector('.typing')?.remove();
      chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">${reply}</div></div>`;
      chatbox.scrollTop = chatbox.scrollHeight;
      return;
    }

    if (conversationState.lastIntent === "overview") {
      const reply = await fetchGeneralEsportsInfo(tempData.college);
      document.querySelector('.typing')?.remove();
      chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">${reply}</div></div>`;
      chatbox.scrollTop = chatbox.scrollHeight;
      return;
    }
  }

  if (conversationState.askingMajor) {
    tempData.major = userMessage;
    conversationState.askingMajor = false;

    const reply = await fetchRankingOrScholarshipInfo(tempData.major);
    document.querySelector('.typing')?.remove();
    chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">${reply}</div></div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    return;
  }

  // Check if the user wants to search online after not finding in the database
  if (lowerMessage === "yes" && conversationState.lastIntent === "findCoach" && !tempData.collegeConfirmed) {
    const fallbackResult = await fetchStaffInfoOnline(tempData.college);
    document.querySelector('.typing')?.remove();
    chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">${fallbackResult}</div></div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    tempData.collegeConfirmed = true;
    return;
  }

  if (lowerMessage.includes("coach") || lowerMessage.includes("contact")) {
    conversationState.askingCollege = true;
    conversationState.lastIntent = "findCoach";
    document.querySelector('.typing')?.remove();
    chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">🎯 Which college contact would you like to see first?</div></div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    return;
  }

  if (lowerMessage.includes("esports team at") || lowerMessage.includes("tell me about")) {
    conversationState.askingCollege = true;
    conversationState.lastIntent = "overview";
    document.querySelector('.typing')?.remove();
    chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">🏫 What college would you like to know more about?</div></div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    return;
  }

  if (lowerMessage.includes("top esports schools") || lowerMessage.includes("best esports scholarships") || lowerMessage.includes("for my major")) {
    conversationState.askingMajor = true;
    conversationState.lastIntent = "rankings";
    document.querySelector('.typing')?.remove();
    chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">📚 What’s your major? (e.g., Computer Science, Game Design, Business...)</div></div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    return;
  }

  // Fallback: send to OpenAI API
  const response = await fetch("api.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: userMessage })
  });

  const data = await response.json();
  document.querySelector('.typing')?.remove();

  if (data.error) {
    chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content"><em>Error: ${JSON.stringify(data.error)}</em></div></div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    return;
  }

  const botResponse = data.choices && data.choices[0] ? data.choices[0].message.content : "Sorry, an error occurred.";
  chatbox.innerHTML += `<div class="message bot-message"><p><strong>🤖 Esports Assistant:</strong></p><div class="bot-content">${formatBotResponse(botResponse)}</div></div>`;
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function findCoachContact(college) {
  const formData = new FormData();
  formData.append("action", "findCoach");
  formData.append("college", college);

  try {
    const response = await fetch("api.php", { method: "POST", body: formData });
    const result = await response.json();

    // College not found in the database
    if (result.status === "not_found") {
      return `❌ I couldn't find <b>${college}</b> in our list of colleges with esports scholarships.<br><br>
      🔍 Would you like me to search online to confirm if they offer an esports program and contact information? (Type <b>yes</b> to proceed)`;
    }

    if (result.status === "success") {
      let reply = `🏫 <b>${college}</b><br>📄 <b>${result.title}</b><br>🧠 ${result.snippet}<br>🔗 <a href="${result.link}" target="_blank">View contact</a>`;
      
      // Append additional staff contact information if available
      if (result.staff) {
        reply += `<br><br>${result.staff}`;
      }
      return reply;
    } else {
      return "❌ No contact info found for this college.";
    }
  } catch (error) {
    return "⚠️ Error fetching coach info.";
  }
}

async function fetchGeneralEsportsInfo(college) {
  const formData = new FormData();
  formData.append("action", "collegeOverview");
  formData.append("college", college);

  try {
    const response = await fetch("api.php", { method: "POST", body: formData });
    const result = await response.json();
    if (result.status === "success") {
      return result.overview;
    } else {
      return "❌ Could not find overview information.";
    }
  } catch (error) {
    return "⚠️ Error fetching overview.";
  }
}

async function fetchRankingOrScholarshipInfo(major) {
  const formData = new FormData();
  formData.append("action", "fetchRankings");
  formData.append("type", major);

  try {
    const response = await fetch("api.php", { method: "POST", body: formData });
    const result = await response.json();
    if (result.status === "success") {
      return result.content;
    } else {
      return "❌ No data available for this major.";
    }
  } catch (error) {
    return "⚠️ Error fetching ranking/scholarship data.";
  }
}

// New function to fetch staff info online if not found in the database
async function fetchStaffInfoOnline(college) {
  const formData = new FormData();
  formData.append("action", "fetchOnlineStaff");
  formData.append("college", college);

  try {
    const response = await fetch("api.php", { method: "POST", body: formData });
    const result = await response.json();

    if (result.status === "success") {
      return result.staff;
    } else {
      return "❌ Unable to fetch online staff contact info for this college.";
    }
  } catch (error) {
    return "⚠️ Error fetching online staff contact info.";
  }
}

function formatBotResponse(response) {
  return response
    .replace(/✅/g, '✅')
    .replace(/🎮/g, '🎮')
    .replace(/🏫/g, '🏫')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function toggleChatbot() {
  const chatbotContainer = document.getElementById("chatbot-container");
  if (chatbotContainer.style.display === "none" || chatbotContainer.style.display === "") {
    chatbotContainer.style.display = "flex";
  } else {
    chatbotContainer.style.display = "none";
  }
}
