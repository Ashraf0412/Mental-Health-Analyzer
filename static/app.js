const textarea = document.getElementById("user-input");
const analyzeBtn = document.getElementById("analyze-btn");
const charCount = document.getElementById("char-count");
const riskLevel = document.getElementById("risk-level");
const riskBadge = document.getElementById("risk-badge");
const concerns = document.getElementById("concerns");
const advice = document.getElementById("advice");
const immediateHelp = document.getElementById("immediate-help");
const tagButtons = document.querySelectorAll(".tag-btn");

textarea.addEventListener("input", () => {
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
    } catch (error) {
        alert(error.message);
    } finally {
        analyzeBtn.textContent = "Analyze Now";
        analyzeBtn.disabled = false;
    }
});
