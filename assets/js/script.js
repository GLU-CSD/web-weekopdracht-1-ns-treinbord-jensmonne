// API configuration
const apiKey = "dff5cb85045446f9861e81fdda13a5d2"; // API key for NS API
const station = "UT"; // Station code for Utrecht
const platform = "15"; // Platform number to filter departures
const nsApiUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?station=${station}`; // NS API URL with station parameter

// Variable to toggle between digital and relative time display
let digital;

// Updates the analog clock on the screen
function updateClock() {
    const now = new Date();

    // Extract current hour, minute, and second
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // Calculate rotation angles for clock hands
    const hourDeg = (hour % 12) * 30 + minute * 0.5;
    const minuteDeg = minute * 6;
    const secondDeg = second * 6;

    // Apply rotation to clock hands using CSS transform
    document.getElementById('hour').style.transform = `rotate(${hourDeg}deg)`;
    document.getElementById('minute').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('second').style.transform = `rotate(${secondDeg}deg)`;
}

// Fetches departure data from the NS API
async function fetchDepartures() {
    try {
        // Make an API request
        const response = await fetch(nsApiUrl, {
            headers: {
                "Ocp-Apim-Subscription-Key": apiKey, // API key header
            },
        });

        // Check for successful response
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        // Parse JSON data from response
        const data = await response.json();
        
        // Pass the fetched departure data for display
        displayDepartures(data.payload.departures);
    } catch (error) {
        console.error("Error fetching departures:", error); // Log any errors
    }
}

// Displays departure information on the board
function displayDepartures(departures) {
    // Filter departures by the specified platform
    const filteredDepartures = departures.filter(
        (departure) => departure.plannedTrack === platform
    );

    // Check if there are any departures for the platform
    if (filteredDepartures.length > 0) {
        const firstDeparture = filteredDepartures[0]; // First departure
        const nextDeparture = filteredDepartures[1]; // Next departure (if available)

        const now = new Date();
        const departureTime = new Date(firstDeparture.actualDateTime);
        const departureTimeFormatted = departureTime.toTimeString().split(" ")[0]; // Format time to "HH:MM:SS"

        // Calculate minutes until the next train
        const minutesUntilArrival = Math.max(
            Math.ceil((departureTime - now) / (1000 * 60)), // Convert milliseconds to minutes
            0
        );

        // Map short train category codes to full names
        const trainTypeMapping = {
            SPR: "Sprinter",
            IC: "Intercity",
            THA: "Thalys",
            ICE: "Intercity Express",
        };
        const trainTypeFull =
            trainTypeMapping[firstDeparture.trainCategory] || firstDeparture.trainCategory;

        // Extract route stations for "via" text
        const routeStations = firstDeparture.routeStations || [];
        const viaText =
            routeStations.length > 0
                ? `via ${routeStations.slice(0, -1).map(station => station.mediumName).join(", ")} en ${routeStations.slice(-1)[0].mediumName}`
                : "";

        // Update digital or relative time display based on toggle
        if (digital === true) {
            document.getElementById("minutes-until").textContent = departureTimeFormatted.split(" ")[0].slice(0, -3); // Show digital time
            document.getElementById("minuut").textContent = ''; // Clear "minutes" label
        } else {
            document.getElementById("minutes-until").textContent = minutesUntilArrival; // Show minutes until train
            document.getElementById("minuut").textContent = minutesUntilArrival <= 1 ? "minuut" : "minuten"; // Singular/plural adjustment
        }

        // Update other departure details on the board
        document.getElementById("train-type").textContent = trainTypeFull;
        document.getElementById("destination").textContent = firstDeparture.direction;
        document.getElementById("via-text").textContent = viaText;
        document.getElementById("platformText").textContent = platform;

        // Display next train departure if available
        if (nextDeparture) {
            const nextDepartureTime = new Date(nextDeparture.actualDateTime);
            const nextDepartureTimeFormatted = nextDepartureTime.toTimeString().split(" ")[0].slice(0, -3);

            document.getElementById("next-train-time").textContent =
                `Hierna/next: ${nextDepartureTimeFormatted} ${nextDeparture.direction}`;
        } else {
            document.getElementById("next-train-time").textContent = "No upcoming trains";
        }
    } else {
        // Update board to show no data if no departures match the platform
        document.getElementById("minutes-until").textContent = "--";
        document.getElementById("minuut").textContent = "minuten";
        document.getElementById("train-type").textContent = "No data";
        document.getElementById("destination").textContent = "No data";
        document.getElementById("via-text").textContent = "";
    }
}

// Toggles between digital and relative time display
function digitalSwtich() {
    digital = !digital; // Toggle the digital variable
    console.log(digital); // Log current state to console
    fetchDepartures(); // Refresh departure display
}

// Initializes the board by setting intervals and starting updates
function initBoard() {
    updateClock(); // Start clock update
    fetchDepartures(); // Fetch initial departure data
    digitalSwtich(); // Initialize digital toggle
    setInterval(updateClock, 1000); // Update clock every second
    setInterval(fetchDepartures, 60000); // Fetch departures every minute
    setInterval(digitalSwtich, 5000); // Switch digital/relative display every 5 seconds
}

// Wait for the DOM to load before initializing the board
document.addEventListener("DOMContentLoaded", initBoard);