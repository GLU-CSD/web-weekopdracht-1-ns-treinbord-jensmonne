const apiKey = "your_api_key_here";
const station = "UT";
const platform = "15";
const nsApiUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?station=${station}`;

let digital;

function updateClock() {
    const now = new Date();

    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const hourDeg = (hour % 12) * 30 + minute * 0.5;
    const minuteDeg = minute * 6;
    const secondDeg = second * 6;

    document.getElementById('hour').style.transform = `rotate(${hourDeg}deg)`;
    document.getElementById('minute').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('second').style.transform = `rotate(${secondDeg}deg)`;
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
    const filteredDepartures = departures.filter(
        (departure) => departure.plannedTrack === platform
    );

    if (filteredDepartures.length > 0) {
        const firstDeparture = filteredDepartures[0];
        const nextDeparture = filteredDepartures[1];

        const now = new Date();
        const departureTime = new Date(firstDeparture.actualDateTime);
        const departureTimeFormatted = departureTime.toTimeString().split(" ")[0]; // Extracts "HH:MM:SS"

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
        if (digital === true) {
            document.getElementById("minutes-until").textContent = departureTimeFormatted.split(" ")[0].slice(0, -3);
            document.getElementById("minuut").textContent = '';
        } else {
            document.getElementById("minutes-until").textContent = minutesUntilArrival;
            document.getElementById("minuut").textContent = minutesUntilArrival <= 1 ? "minuut" : "minuten";
        }
        document.getElementById("train-type").textContent = trainTypeFull;
        document.getElementById("destination").textContent = firstDeparture.direction;
        document.getElementById("via-text").textContent = viaText;
        document.getElementById("platformText").textContent = platform;

        if (nextDeparture) {
            const nextDepartureTime = new Date(nextDeparture.actualDateTime);
            const nextDepartureTimeFormatted = nextDepartureTime.toTimeString().split(" ")[0].slice(0, -3);

            document.getElementById("next-train-time").textContent =
                `Hierna/next: ${nextDepartureTimeFormatted} ${nextDeparture.direction}`;
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

function digitalSwtich() {
    digital = !digital;
    console.log(digital);
    fetchDepartures();
}

function initBoard() {
    updateClock();
    fetchDepartures();
    digitalSwtich();
    setInterval(updateClock, 1000);
    setInterval(fetchDepartures, 60000);
    setInterval(digitalSwtich, 5000);
}

document.addEventListener("DOMContentLoaded", initBoard);