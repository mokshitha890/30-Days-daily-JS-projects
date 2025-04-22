
import { GoogleGenAI } from "@google/genai";

export async function getFlightNumLocDt(flightNumber, location, arrivalDate) {
    // simulate 10 sec delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(process.env.FLIGHT_API_KEY, process.env.WEATHER_API_KEY, process.env.NEWS_API_KEY);


    const flightData = await getFlightInfo(flightNumber, location, arrivalDate);
    // console.log("flightData", flightData);

    const airlineNewsInfo = await getFlightInfoNews(flightData?.airlineName);
    // console.log("airlineNewsInfo", airlineNewsInfo);

    // if (airlineNewsInfo?.length > 0) GenNewsUI(airlineNewsInfo);

    const weatherData = await getweatherInfo(location, arrivalDate, flightData?.arrivalScheduleTimeInHour);
    // if (weatherData) {
    //     PopulateMap(weatherData?.loca_lat, weatherData?.loca_lon);
    //     GenWeatherUI(weatherData)
    // };
    // console.log("weatherData", weatherData);
    const result = { flightData, airlineNewsInfo, weatherData }
    // console.log("result", result);
    const AiResponce = await GenGeminiAiText(result)
    result.AiResult = AiResponce;
    return result;
}

async function GenGeminiAiText(result) {
    // return "Okay, here's an analysis of the landing conditions for Air India flight AI621, landing at 05:00, based on the provided weather information:\n\n```md\n# AI621 Landing Conditions Prediction - 05:00\n\n**Flight:** AI621 (Air India)\n**Landing Time:** 05:00 Local Time\n\n## Weather Conditions:\n\n*   **Temperature:** 23°C (Moderate)\n*   **Precipitation:** 0% Chance of Rain (Clear)\n*   **Humidity:** 10% (Very Low)\n*   **Wind:** 20 kph (Moderate) - *Wind Direction Missing - This is a CRITICAL factor.*\n\n## Analysis:\n\nBased on the provided data, here's a breakdown of the factors affecting the landing:\n\n**Positive Factors:**\n\n*   **Temperature:** 23°C is a moderate and comfortable temperature for landing. It shouldn't pose any significant challenges to aircraft performance.\n*   **Precipitation:** 0% chance of rain indicates clear skies. This eliminates the risks associated with reduced visibility and slippery runways.\n*   **Humidity:** Very low humidity (10%) is a positive factor. It reduces the risk of condensation on the aircraft and improves engine performance.\n\n**Concerning Factors:**\n\n*   **Wind Speed:** 20 kph is a moderate wind speed. While manageable, it will require the pilots to make appropriate adjustments during the approach and landing. Crosswinds, in particular, can be challenging.\n*   **Missing Wind Direction:**  **The *absence* of wind direction is a *MAJOR* concern.** Wind direction is *crucial* for determining if the wind is a headwind, tailwind, or crosswind.\n\n**Impact of Wind Direction (Illustrative Examples):**\n\n*   **Headwind:** A headwind (blowing towards the aircraft's direction of travel) is *beneficial* for landing. It increases lift and reduces the ground speed, resulting in a shorter landing distance.\n*   **Tailwind:** A tailwind (blowing from behind the aircraft) is *detrimental* for landing. It decreases lift and increases ground speed, requiring a longer landing distance. Tailwinds are generally undesirable and can increase the risk of overrunning the runway.\n*   **Crosswind:** A crosswind (blowing from the side) is *challenging*. It requires the pilot to use techniques like crabbing or sideslipping to maintain the aircraft's alignment with the runway. Strong crosswinds can be difficult to manage and increase the risk of a hard landing or deviation from the runway centerline.\n\n## Landing Safety Probability Score:\n\n**Without Wind Direction:** Impossible to give a proper assessment\n\n**Explanation:**\n\nBecause the wind direction is missing, I am unable to give you any reasonable assesment of the landing conditions.\n```\n\n**Important Considerations:**\n\n*   **Pilot Skill:**  The pilot's experience and proficiency in handling various wind conditions are paramount.\n*   **Aircraft Type:** Different aircraft have different tolerances for wind and weather conditions.\n*   **Runway Length:** The length of the runway is a critical factor, especially with potentially unfavorable wind conditions.\n*   **Airport Infrastructure:**  Factors like the availability of Instrument Landing Systems (ILS) and other navigational aids can enhance safety in marginal conditions.\n*   **Wind Shear:** Although not explicitly mentioned, wind shear (sudden changes in wind speed and direction) can be a serious hazard during landing. Pilots will be monitoring for this.\n\n**Disclaimer:**  This is a preliminary assessment based on limited information. A comprehensive evaluation would require real-time weather data, pilot reports, and a thorough understanding of the airport's specific operating procedures.\n"
    const flightData = result?.flightData;
    const airlineNewsInfo = result?.airlineNewsInfo;
    const weatherData = result?.weatherData;
    const flightNumber = flightData?.flightNumber;
    const airlineName = flightData?.airlineName;
    const arrivalScheduleTimeInHour = flightData?.arrivalScheduleTimeInHour;
    const chance_of_rain = weatherData?.chance_of_rain;
    const humidity = weatherData?.humidity;
    const temp_c = weatherData?.temp_c;
    const wind_direction = weatherData?.wind_direction;
    const wind_kph = weatherData?.wind_kph;
    console.log(process.env.GEMINI_API_KEY)
    const GeminiAiPrompt = `your an expert in flight landing and weather information specialist
                            given ${flightNumber} flight number of ${airlineName} is landing at ${arrivalScheduleTimeInHour} hours.
                            the weather is ${temp_c} degree celsius with ${chance_of_rain} chance of rain and ${humidity} humidity.
                            the wind is ${wind_kph} kph in ${wind_direction} direction.
                            now based on this data generate prediction about flight landing conditions and probability of landing safely 0 tO 10 score
                            give me in md format
                            dont give me code snippet orcode block in md format
                            `
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    const config = {
        responseMimeType: 'text/plain',
    };
    const model = 'gemini-2.0-flash';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: GeminiAiPrompt,
                },
            ],
        },

    ];

    const response = await ai.models.generateContent({
        model,
        config,
        contents,
    });
    console.log(response);
    const text = response?.text;
    return text;
    // flight number ${flightNumber} of ${airlineName} is landing at ${arrivalScheduleTimeInHour} hours.                           `
}
export async function getFlightInfo(flightNumber, location, arrivalDate) {
    // return { "airlineName": "Air India", arrivalScheduleTimeInHour: "05", flightNumber };
    try {
        const queryParams = new URLSearchParams({
            iataCode: location,
            type: "arrival",
            date: arrivalDate,
            access_key: process.env.FLIGHT_API_KEY,
            flight_number: flightNumber,
        });
        const url = `https://api.aviationstack.com/v1/flightsFuture?${queryParams.toString()}`;
        console.log(url)
        const response = await fetch(url);
        const resp = await response.json();
        // console.log("resp", resp);
        const data = resp?.data;
        // console.log("@@ flightdat", data);

        // we need to get airline.name, arrival.scheduldeTime in first arr elm
        const airlineName = data[0]?.airline?.name;
        const arrivalScheduleTime = data[0]?.arrival?.scheduledTime;
        const arrivalScheduleTimeInHour = arrivalScheduleTime.split(":")[0];
        return {
            airlineName,
            arrivalScheduleTimeInHour,
            flightNumber
        }
            ;
    } catch (error) {
        console.log(error)
    }
}

async function getweatherInfo(city, date, hour) {
    // return { "chance_of_rain": 0, "humidity": 10, "temp_c": 23, "wind_direction": "", "wind_kph": 20, "loca_name": "", "loca_lat": 13.75, "loca_lon": 79.70, "loca_region": "" };
    // const city = "Bangalore";
    try {
        const queryParams = new URLSearchParams({
            q: city,
            key: process.env.WEATHER_API_KEY,
            dt: date,
            hour,
        });
        const url = `http://api.weatherapi.com/v1/forecast.json?${queryParams.toString()}`;
        const response = await fetch(url);
        const resp = await response.json();
        // console.log(resp);
        const forecastData = resp?.forecast?.forecastday[0]?.hour[0];
        const forecastDataObg = {
            chance_of_rain: forecastData?.chance_of_rain,
            humidity: forecastData?.humidity,
            temp_c: forecastData?.temp_c,
            wind_direction: forecastData?.wind_dir,
            wind_kph: forecastData?.wind_kph,
            loca_name: resp?.location?.name,
            loca_lat: resp?.location?.lat,
            loca_lon: resp?.location?.lon,
            loca_region: resp?.location?.region,
        };
        return forecastDataObg;

    } catch (error) {

    }
}
async function getFlightInfoNews(airlineName) {
    // return [
    //     { "title": "air india", "description": "If you’ve flown recently, you have probably made the same observation I have: No one pays attention to the pre-flight safety videos. There may be the occasional uptick in interest after a well-publicized crash or near-disaster, but soon old habits return—peop…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
    //     { "title": " indigo", "description": "Singapore Airlines (SIA) has embarked on a significant renovation of its SilverKris and KrisFlyer Gold lounges at Changi Airport Terminal…\nThe post Singapore Airlines Terminal 2 Lounges at Changi Airport Getting a Makeover appeared first on Points Miles and B…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
    //     { "title": "indigo", "description": "Airline Partners With MicroTau to Install ‘Shark Skin’ Riblets on Its B767s In an effort to cut fuel consumption and improve sustainability, Delta Airlines has announced a partnership with MicroTau to install ‘shark skin’ riblets on its jets. The technology i…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
    //     { "title": "indigo", "description": "Fotografi-simulator till Xbox och PC\n\nNu har Annapurna Interactive släppt Matt Newells Lushfoil Photography Sim, en simulatorupplevelse som går ut på att användaren ska gå runt och spela fotograf.\n\nFörutom massa fantastiska miljöer att fotografera …", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" }
    // ]

    try {
        const queryParams = new URLSearchParams({
            from: "2025-04-16",
            to: "2025-04-16",
            sortBy: "relevancy",
            apiKey: process.env.NEWS_API_KEY,
            q: `+${airlineName}`,
            language: "en",
            excludeDomains: "slickdeals.net",
            PageSize: 2,
        });

        const url = `https://newsapi.org/v2/everything?${queryParams.toString()}`;
        const response = await fetch(url);
        const resp = await response.json();
        // console.log(resp);
        const articles = resp?.articles;
        const newsData = articles.map((article) => {
            return {
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
            };
        });
        return newsData;
    } catch (e) {
        console.log(e)
    }
}