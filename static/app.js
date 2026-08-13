const textarea = document.getElementById("user-input");
const analyzeBtn = document.getElementById("analyze-btn");
const charCount = document.getElementById("char-count");
const riskLevel = document.getElementById("risk-level");
const riskBadge = document.getElementById("risk-badge");
const concerns = document.getElementById("concerns");
const advice = document.getElementById("advice");
const immediateHelp = document.getElementById("immediate-help");
const tagButtons = document.querySelectorAll(".tag-btn");
const homeLink = document.getElementById("home-link");
const historyLink = document.getElementById("history-link");
const backBtn = document.getElementById("back-btn");
const historyPanel = document.querySelector(".history-panel");
const heroGrid = document.querySelector(".hero-grid");
const historyList = document.getElementById("history-list");

// Audio recording variables
let mediaRecorder;
let audioChunks = [];
let recordingStartTime;
let recordingTimer;
const recordBtn = document.getElementById("record-btn");
const stopRecordBtn = document.getElementById("stop-record-btn");
const recordingTime = document.getElementById("recording-time");
const audioPlayback = document.getElementById("audio-playback");
const audioPlayer = document.getElementById("audio-player");
const clearRecordingBtn = document.getElementById("clear-recording-btn");
const audioFileInput = document.getElementById("audio-file-input");
const fileName = document.getElementById("file-name");
const analyzeAudioBtn = document.getElementById("analyze-audio-btn");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Tab switching
tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const tabName = btn.getAttribute("data-tab");
        
        tabBtns.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));
        
        btn.classList.add("active");
        document.getElementById(`${tabName}-tab`).classList.add("active");
    });
});

// Audio recording functions
function startRecording() {
    audioChunks = [];
    recordingStartTime = Date.now();
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            audioPlayback.classList.remove("hidden");
        };
        
        mediaRecorder.start();
        recordBtn.disabled = true;
        stopRecordBtn.disabled = false;
        
        recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            recordingTime.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            recordingTime.classList.remove("hidden");
        }, 1000);
    }).catch((error) => {
        alert("Error accessing microphone: " + error.message);
    });
}

function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    
    clearInterval(recordingTimer);
}

recordBtn.addEventListener("click", startRecording);
stopRecordBtn.addEventListener("click", stopRecording);

clearRecordingBtn.addEventListener("click", () => {
    audioPlayback.classList.add("hidden");
    audioPlayer.src = "";
    audioChunks = [];
    recordingTime.textContent = "0:00";
    recordingTime.classList.add("hidden");
});

audioFileInput.addEventListener("change", () => {
    if (audioFileInput.files.length > 0) {
        fileName.textContent = audioFileInput.files[0].name;
    }
});

analyzeAudioBtn.addEventListener("click", async () => {
    const formData = new FormData();
    
    if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        formData.append("audio", audioBlob, "recording.wav");
    } else if (audioFileInput.files.length > 0) {
        formData.append("audio", audioFileInput.files[0]);
    } else {
        alert("Please record audio or upload a file.");
        return;
    }
    
    analyzeAudioBtn.textContent = "Analyzing Audio...";
    analyzeAudioBtn.disabled = true;
    
    try {
        const response = await fetch("/upload-audio", {
            method: "POST",
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || "Audio analysis failed.");
        }
        
        // Display transcribed text in textarea
        if (result.transcribed_text) {
            textarea.value = result.transcribed_text;
            textarea.dispatchEvent(new Event("input"));
        }
        
        // Display analysis results
        riskLevel.textContent = result.risk_level || "Unknown";
        riskBadge.textContent = result.risk_level ? result.risk_level.toUpperCase() : "No data";
        concerns.innerHTML = result.concerns && result.concerns.length > 0
            ? result.concerns.map((item) => `<span>${item}</span>`).join("")
            : "<span>No concerns detected</span>";
        advice.textContent = result.advice || "No advice available.";
        immediateHelp.textContent = result.requires_immediate_help ? "Yes" : "No";
        
        saveHistory({
            text: result.transcribed_text,
            result,
            createdAt: new Date().toISOString(),
            source: "audio"
        });
    } catch (error) {
        alert(error.message);
    } finally {
        analyzeAudioBtn.textContent = "Analyze Audio";
        analyzeAudioBtn.disabled = false;
    }
});

function getHistory() {
    return JSON.parse(localStorage.getItem("analysisHistory") || "[]");
}

function saveHistory(entry) {
    const history = getHistory();
    history.unshift(entry);
    localStorage.setItem("analysisHistory", JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
    const history = getHistory();
    if (!history.length) {
        historyList.innerHTML = '<p class="muted">No history yet. Analyze some text to save entries.</p>';
        return;
    }

    historyList.innerHTML = history.map((item) => `
        <div class="history-item">
            <div class="history-text">${item.text}</div>
            <div class="history-meta">
                <span><strong>Risk:</strong> ${item.result.risk_level}</span>
                <span><strong>Help:</strong> ${item.result.requires_immediate_help ? "Yes" : "No"}</span>
                ${item.source ? `<span><strong>Source:</strong> ${item.source}</span>` : ""}
            </div>
            <div class="history-concerns">Concerns: ${item.result.concerns.length ? item.result.concerns.join(", ") : "None"}</div>
            <div class="history-advice">Advice: ${item.result.advice}</div>
        </div>
    `).join("");
}

typeof textarea !== "undefined" && textarea.addEventListener("input", () => {
    const length = textarea.value.length;
    charCount.textContent = `${length}/1000`;
});

tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
        textarea.value = button.textContent;
        textarea.dispatchEvent(new Event("input"));
    });
});

analyzeBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) {
        alert("Please enter your thoughts before analyzing.");
        return;
    }

    analyzeBtn.textContent = "Analyzing...";
    analyzeBtn.disabled = true;

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Analysis failed.");
        }

        riskLevel.textContent = result.risk_level || "Unknown";
        riskBadge.textContent = result.risk_level ? result.risk_level.toUpperCase() : "No data";
        concerns.innerHTML = result.concerns && result.concerns.length > 0
            ? result.concerns.map((item) => `<span>${item}</span>`).join("")
            : "<span>No concerns detected</span>";
        advice.textContent = result.advice || "No advice available.";
        immediateHelp.textContent = result.requires_immediate_help ? "Yes" : "No";

        saveHistory({
            text,
            result,
            createdAt: new Date().toISOString(),
            source: "text"
        });
    } catch (error) {
        alert(error.message);
    } finally {
        analyzeBtn.textContent = "Analyze Now";
        analyzeBtn.disabled = false;
    }
});

historyLink.addEventListener("click", () => {
    homeLink.classList.remove("active");
    historyLink.classList.add("active");
    heroGrid.classList.add("hidden");
    historyPanel.classList.remove("hidden");
    renderHistory();
});

homeLink.addEventListener("click", () => {
    historyLink.classList.remove("active");
    homeLink.classList.add("active");
    heroGrid.classList.remove("hidden");
    historyPanel.classList.add("hidden");
});

backBtn.addEventListener("click", () => {
    historyLink.classList.remove("active");
    homeLink.classList.add("active");
    heroGrid.classList.remove("hidden");
    historyPanel.classList.add("hidden");
});
    }
});

historyLink.addEventListener("click", () => {
    homeLink.classList.remove("active");
    historyLink.classList.add("active");
    heroGrid.classList.add("hidden");
    historyPanel.classList.remove("hidden");
    renderHistory();
});

homeLink.addEventListener("click", () => {
    historyLink.classList.remove("active");
    homeLink.classList.add("active");
    heroGrid.classList.remove("hidden");
    historyPanel.classList.add("hidden");
});

backBtn.addEventListener("click", () => {
    historyLink.classList.remove("active");
    homeLink.classList.add("active");
    heroGrid.classList.remove("hidden");
    historyPanel.classList.add("hidden");
});
