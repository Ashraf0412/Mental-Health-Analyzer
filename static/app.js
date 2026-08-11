const textarea = document.getElementById("user-input");
const analyzeBtn = document.getElementById("analyze-btn");
const charCount = document.getElementById("char-count");
const riskLevel = document.getElementById("risk-level");
const riskBadge = document.getElementById("risk-badge");
const concerns = document.getElementById("concerns");
const advice = document.getElementById("advice");
const immediateHelp = document.getElementById("immediate-help");
const tagButtons = document.querySelectorAll(".tag-btn");
const historyLink = document.getElementById("history-link");
const backBtn = document.getElementById("back-btn");
const historyPanel = document.querySelector(".history-panel");
const heroGrid = document.querySelector(".hero-grid");
const historyList = document.getElementById("history-list");

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
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        alert(error.message);
    } finally {
        analyzeBtn.textContent = "Analyze Now";
        analyzeBtn.disabled = false;
    }
});

historyLink.addEventListener("click", () => {
    historyLink.classList.add("active");
    heroGrid.classList.add("hidden");
    historyPanel.classList.remove("hidden");
    renderHistory();
});

backBtn.addEventListener("click", () => {
    historyLink.classList.remove("active");
    heroGrid.classList.remove("hidden");
    historyPanel.classList.add("hidden");
});
