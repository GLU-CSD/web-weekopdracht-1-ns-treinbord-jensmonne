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
        displayNextTrainInfo(data.payload.departures);
    } catch (error) {
        console.error("Error fetching departures:", error);
    }
}

function displayDepartures(departures) {
    const filteredDepartures = departures.filter(
        (departure) => departure.plannedTrack === platform
    );

    if (filteredDepartures.length > 0) {
        const firstDeparture = filteredDepartures[0];

        const nextDeparture = filteredDepartures[1];

        const now = new Date();
        const departureTime = new Date(firstDeparture.actualDateTime);
        const minutesUntilArrival = Math.max(
            Math.ceil((departureTime - now) / (1000 * 60)),
            0
        );

        const trainTypeMapping = {
            SPR: "Sprinter",
            IC: "Intercity",
            THA: "Thalys",
            ICE: "Intercity Express",
        };
        const trainTypeFull =
            trainTypeMapping[firstDeparture.trainCategory] || firstDeparture.trainCategory;

        const routeStations = firstDeparture.routeStations || [];
        const viaText =
            routeStations.length > 0
                ? `via ${routeStations.slice(0, -1).map(station => station.mediumName).join(", ")} en ${routeStations.slice(-1)[0].mediumName}`
                : "";

        document.getElementById("minutes-until").textContent = minutesUntilArrival;
        document.getElementById("minuut").textContent = minutesUntilArrival <= 1 ? "minuut" : "minuten";
        document.getElementById("train-type").textContent = trainTypeFull;
        document.getElementById("destination").textContent = firstDeparture.direction;
        document.getElementById("via-text").textContent = viaText;
        document.getElementById("platformText").textContent = platform;


        if (nextDeparture) {
            const now = new Date();
            const departureTime = new Date(nextDeparture.actualDateTime);
            const minutesUntilArrival = Math.max(
                Math.ceil((departureTime - now) / (1000 * 60)),
                0
            );
    
            document.getElementById("next-train-time").textContent = `Hierna/next: ${nextDeparture.actualDateTime.split("T")[1].slice(0, 5)} ${nextDeparture.direction}`;
        } else {
            document.getElementById("next-train-time").textContent = "No upcoming trains";
        }
    } else {
        document.getElementById("minutes-until").textContent = "--";
        document.getElementById("minuut").textContent = "minuten";
        document.getElementById("train-type").textContent = "No data";
        document.getElementById("destination").textContent = "No data";
        document.getElementById("via-text").textContent = "";
    }
}

function initBoard() {
    updateClock();
    fetchDepartures();
    setInterval(updateClock, 1000);
    setInterval(fetchDepartures, 60000);
}

document.addEventListener("DOMContentLoaded", initBoard);