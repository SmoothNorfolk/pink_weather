const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");
const locationBtn = document.getElementById("locationBtn");

const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");
const conditionElement = document.getElementById("condition");
const detailsElement = document.getElementById("details");
const weatherIconElement = document.getElementById("weatherIcon");

const forecastElement = document.getElementById("forecast");
const statusElement = document.getElementById("status");


const weatherCodes = {

    0: ["☀️", "Ciel dégagé"],

    1: ["🌤️", "Principalement dégagé"],
    2: ["⛅", "Partiellement nuageux"],
    3: ["☁️", "Couvert"],

    45: ["🌫️", "Brouillard"],
    48: ["🌫️", "Brouillard givrant"],

    51: ["🌦️", "Bruine légère"],
    53: ["🌦️", "Bruine"],
    55: ["🌧️", "Bruine forte"],

    61: ["🌧️", "Pluie légère"],
    63: ["🌧️", "Pluie"],
    65: ["🌧️", "Forte pluie"],

    71: ["🌨️", "Neige légère"],
    73: ["🌨️", "Neige"],
    75: ["❄️", "Forte neige"],

    80: ["🌦️", "Averses"],
    81: ["🌦️", "Averses"],
    82: ["⛈️", "Fortes averses"],

    95: ["⛈️", "Orage"],
    96: ["⛈️", "Orage avec grêle"],
    99: ["⛈️", "Orage avec grêle"]
};


const days = [
    "dim.",
    "lun.",
    "mar.",
    "mer.",
    "jeu.",
    "ven.",
    "sam."
];


async function getWeather(latitude, longitude, city, country) {

    statusElement.textContent =
        "Actualisation de la météo ✨";

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&forecast_days=7` +
        `&timezone=auto`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        const current = data.current;

        const weather =
            weatherCodes[current.weather_code]
            || ["🌸", "Météo inconnue"];


        cityElement.textContent =
            country
                ? `${city}, ${country}`
                : city;

        temperatureElement.textContent =
            Math.round(current.temperature_2m);

        conditionElement.textContent =
            weather[1];

        weatherIconElement.textContent =
            weather[0];

        detailsElement.textContent =
            `💧 ${current.relative_humidity_2m}%　` +
            `💨 ${Math.round(current.wind_speed_10m)} km/h`;


        forecastElement.innerHTML = "";


        data.daily.time.forEach((date, index) => {

            const dateObject =
                new Date(date + "T12:00:00");

            const weatherCode =
                data.daily.weather_code[index];

            const weatherInfo =
                weatherCodes[weatherCode]
                || ["🌸", ""];


            const day = document.createElement("div");

            day.className = "day";

            day.innerHTML = `

                <div class="day-name">
                    ${
                        index === 0
                        ? "Aujourd'hui"
                        : days[dateObject.getDay()]
                    }
                </div>

                <div class="day-icon">
                    ${weatherInfo[0]}
                </div>

                <div class="max">
                    ${Math.round(
                        data.daily.temperature_2m_max[index]
                    )}°
                </div>

                <div class="min">
                    ${Math.round(
                        data.daily.temperature_2m_min[index]
                    )}°
                </div>

            `;

            forecastElement.appendChild(day);
        });


        statusElement.textContent =
            "Météo mise à jour 💗";

    } catch (error) {

        statusElement.textContent =
            "Impossible de récupérer la météo 💔";

        console.error(error);
    }
}


async function searchCity(city) {

    if (!city) return;

    statusElement.textContent =
        "Recherche de la ville... 🔎";


    const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=fr` +
        `&format=json`;


    const response = await fetch(url);

    const data = await response.json();


    if (!data.results || data.results.length === 0) {

        throw new Error("Ville introuvable");
    }


    const result = data.results[0];


    await getWeather(
        result.latitude,
        result.longitude,
        result.name,
        result.country
    );
}


searchForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    try {

        await searchCity(
            cityInput.value.trim()
        );

    } catch {

        statusElement.textContent =
            "Ville introuvable 💔";
    }
});


locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        statusElement.textContent =
            "La géolocalisation n'est pas disponible 💔";

        return;
    }


    statusElement.textContent =
        "Recherche de ta position... 📍";


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            await getWeather(
                position.coords.latitude,
                position.coords.longitude,
                "Ma position",
                ""
            );

        },

        () => {

            statusElement.textContent =
                "Tu as refusé la localisation 💗";
        }
    );
});


searchCity("Amiens");
