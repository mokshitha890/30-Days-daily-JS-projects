window.addEventListener('load', function () {
    console.log('All assets are loaded')

    toggleCard('none')

    toggleNews('none')

    toggleLoading('none')
    toggleErrorMessage('none')
})

function toggleCard(displayProperty) {
    const displayCard = document.querySelector('.display-card')
    displayCard.style.display = displayProperty;
}

function toggleNews(displayProperty) {
    const news = document.querySelector('.news')
    news.style.display = displayProperty
}

function toggleLoading(displayProperty) {
    const loading = document.querySelector('.loading')
    loading.style.display = displayProperty
}

function toggleInitialInfo(displayProperty) {
    const initialContent = document.getElementsByClassName("initial-info")[0];
    console.log(initialContent);
    initialContent.style.display = displayProperty;
}

document.getElementById("error-close").addEventListener("click", () => {
    console.log("@@ close error message")
    const errorMessage = document.getElementById("error-info");
    errorMessage.style.display = "none";
})

function toggleErrorMessage(displayProperty) {
    const errorMessage = document.getElementById("error-info");
    errorMessage.style.display = displayProperty;
}

function toggleSearchButtonDisable() {
    const searchButton = document.getElementById("search_bar");
    console.log("@@ sra", searchButton.disabled);
    searchButton.disabled = !searchButton.disabled;
    searchButton.style.cursor = searchButton.disabled ? "pointer" : "not-allowed";
    searchButton.style.backgroundColor = searchButton.disabled ? "gray" : "black";
}

function displayErrorMessage(message) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function PopulateMap(lat, lon) {
    const map = L.map('map').setView([lat, lon], 13);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}



function GenWeatherUI(weatherData) {
    const temperature = document.querySelector('.weather-info>div:nth-child(1)');
    temperature.textContent = `${weatherData.temp_c}°C`

    const humidity = document.querySelector('.weather-info>div:nth-child(2)');
    humidity.textContent = `${weatherData.humidity}%`;


    const chanceOfRain = document.querySelector('.weather-info>div:nth-child(3)');
    chanceOfRain.textContent = `${weatherData.chance_of_rain}%`;

    const windDirection = document.querySelector('.weather-info>div:nth-child(4)');
    windDirection.textContent = `${weatherData.wind_direction}`;

}

function GenNewsUI(newsData) {
    const newsContainer = document.querySelector('.news');
    newsContainer.innerHTML = "";
    let newsHTML = "<h2>News</h2>";
    console.log("newsData", newsData);
    newsData.forEach((newsitem) => {
        newsHTML += `
          <div class="dispaly-news">
                    <img class="news-image" src="${newsitem.urlToImage}"/>
                    <div class="news-content">
                        <div class="news-title"> <a href="${newsitem.url}">${newsitem.title}</a></div>
                        <p>${newsitem.description}</p>
                    </div>
                </div>`;
    })
    newsContainer.innerHTML = newsHTML;
}

function populateAIResonseUI(AiResult) {

    document.getElementById('ai-content').innerHTML = ""; // Clear previous content
    document.getElementById('ai-content').innerHTML =
        marked.parse(AiResult);

}



// getFlightNumLocDt();
document.getElementById("search_bar").addEventListener("click", async () => {
    console.log("@@ calling search bar")

    toggleInitialInfo('none')

    toggleLoading('block')
    toggleSearchButtonDisable()

    const flightNumber = document.getElementById("flight-number").value;
    const location = document.getElementById("location").value;
    // convert to uppercase
    const locUpper = location.toUpperCase();
    const arrivalDate = document.getElementById("date").value;
    console.log(flightNumber, location, arrivalDate);

    if (flightNumber && locUpper && arrivalDate) {
        // getFlightNumLocDt(flightNumber, locUpper, arrivalDate);
        const queryParams = new URLSearchParams({
            flightNumber: flightNumber,
            location: locUpper,
            date: arrivalDate,
        });

        try {
            const response = await fetch(`http://localhost:3000/result?${queryParams.toString()}`);
            const result = await response.json();
            console.log(result)

            toggleLoading('none')

            toggleCard('block')

            toggleNews('block')

            const { flightData, airlineNewsInfo, weatherData, AiResult } = result;

            // UI genrateion
            PopulateMap(weatherData?.loca_lat, weatherData?.loca_lon);
            GenWeatherUI(weatherData)
            // news info
            if (airlineNewsInfo?.length > 0) GenNewsUI(airlineNewsInfo);
            // populate Ai Response UI
            populateAIResonseUI(AiResult);

        } catch (error) {
            console.error(error);
            toggleErrorMessage('flex')
            toggleLoading('none')
        };

        toggleSearchButtonDisable();
    }
    else {
        alert("Please enter all the fields");
    }
})




