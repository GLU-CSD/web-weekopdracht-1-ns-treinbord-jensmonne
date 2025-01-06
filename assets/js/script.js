const apiKey = "your_api_key_here";
const station = "UT";
const platform = "15";
const nsApiUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?station=${station}`;

function updateClock() {
    const clockElement = document.querySelector("#clock h1");
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString();
}

async function fetchDepartures() {
    try {
        const response = await fetch(nsApiUrl, {
            headers: {
                "Ocp-Apim-Subscription-Key": apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        displayDepartures(data.payload.departures);
    } catch (error) {
        console.error("Error fetching departures:", error);
    }
}

function displayDepartures(departures) {
    const departureListElement = document.querySelector("#departure-list");

    const filteredDepartures = departures.filter(
        (departure) => departure.plannedTrack === platform
    );

    if (filteredDepartures.length === 0) {
        departureListElement.innerHTML = `<tr><td colspan="4">No departures found for platform ${platform}.</td></tr>`;
        return;
    }

    departureListElement.innerHTML = filteredDepartures
        .map(
            (departure) => `
                <tr>
                    <td>${departure.actualDateTime.split("T")[1].slice(0, 5)}</td>
                    <td>${departure.direction}</td>
                    <td>${departure.trainCategory}</td>
                    <td>${departure.plannedTrack}</td>
                </tr>
            `
        )
        .join("");
}

function initBoard() {
    updateClock();
    fetchDepartures();
    setInterval(updateClock, 1000);
    setInterval(fetchDepartures, 60000);
}

document.addEventListener("DOMContentLoaded", initBoard);