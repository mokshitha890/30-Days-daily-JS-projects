
async function loadData() {
  try {
    const response = await fetch('./data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
}

loadData().then(async data => {

  let originalData = [];
  let filteredData = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  const sortState = {};
  let favoriteSet = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));



  originalData = data;
  filteredData = [...originalData];

  function createTable() {
    const keys = Object.keys(data[0]);
    let tableHeaders = '';

    keys.forEach((key, index) => {
      let formattedKey = key
        .replace(/_/g, ' ')
        .replace(/^(\d+h|\d+d)$/, '$1')
        .replace(/\b\w/g, c => c.toUpperCase());

      tableHeaders += `<th>${formattedKey}</th>`;

      if (key.toLowerCase() === 'rank') {
        tableHeaders += `<th>Fav</th>`;
      }
    });

    const tableHTML = `
      <table class="crypto-table table table-hover align-middle text-center">
        <thead class="table-light px-2" style="cursor: pointer; padding: 10px;">
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
    document.getElementById('table-container').innerHTML = tableHTML;
  }

  function renderTableBody(dataToRender) {
    const keys = Object.keys(originalData[0]);
    const tableBody = document.querySelector('.crypto-table tbody');

    const paginatedData = dataToRender.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    tableBody.innerHTML = paginatedData.map(coin => {
      let rowHTML = '<tr>';
      keys.forEach(key => {
        const value = coin[key];
        let cellHTML;

        if (typeof value === 'number') {
          const formatted = key.includes("price") || key.includes("volume") || key.includes("market")
            ? `$${value.toLocaleString()}`
            : value.toLocaleString();
          cellHTML = `<td>${formatted}</td>`;
        } else {
          cellHTML = `<td>${value}</td>`;
        }

        rowHTML += cellHTML;

        if (key.toLowerCase() === 'rank') {
          const isFav = favoriteSet.has(coin.symbol);
          const starIcon = isFav ? 'star-solid.svg' : 'star-regular.svg';

          rowHTML += `<td><img src="./coins-logo/${starIcon}" 
                        style="height:20px; cursor:pointer;" 
                        class="fav-icon" 
                        data-symbol="${coin.symbol}" /></td>`;
        }
      });
      rowHTML += '</tr>';
      return rowHTML;
    }).join('');
  }


  function attachFavToggle() {
    document.querySelectorAll('.fav-icon').forEach(icon => {
      icon.addEventListener('click', function () {
        const symbol = this.getAttribute('data-symbol');

        if (favoriteSet.has(symbol)) {
          favoriteSet.delete(symbol);
        } else {
          favoriteSet.add(symbol);
        }
        localStorage.setItem('favorites', JSON.stringify([...favoriteSet]));

        renderTableBody(filteredData);
        attachFavToggle();
      });
    });
  }

  let columnIndex = '';

  function sortTable(column, direction) {
    const keys = Object.keys(originalData[0])
    const key = keys[columnIndex - 1];
    filteredData.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    currentPage = 1
    renderTableBody(filteredData)
    CreatePegination()
  }


  function addTableHeader() {
    document.querySelectorAll('.crypto-table thead th').forEach((header, index) => {
      header.addEventListener('click', () => {
        columnIndex = index + 1
        const column = index + 1;
        const currentDir = sortState[column] || 'asc';
        const newDir = currentDir === 'desc' ? 'asc' : 'desc';
        sortState[column] = newDir;
        console.log(sortState[column])
        sortTable(column, newDir);
      });
    });
  }

  function CreatePegination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginationContainer = document.querySelector('.pagination')

    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li')

      li.className = 'page-item';
      if (i === currentPage) {
        li.classList.add('active')
      }

      const button = document.createElement('button');
      button.className = 'page-link';
      button.textContent = i;

      button.addEventListener('click', (e) => {
        e.preventDefault()

        currentPage = i;
        renderTableBody(filteredData);
        CreatePegination();
        attachFavToggle()
      });
      li.appendChild(button);
      paginationContainer.appendChild(li);
    }
  }

  const searchButton = document.getElementsByClassName('search-button')[0]
  const inputContent = document.getElementsByClassName('input-content')[0]

  let typedSearch = '';
  let searchTimeout;

  function handleSearch() {

    typedSearch += inputContent.value.toLowerCase();
    filterTable(typedSearch);
  }
  searchButton.addEventListener('click', handleSearch);

  inputContent.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      handleSearch()
    }

  })

  inputContent.addEventListener('input', function () {
    typedSearch = inputContent.value.toLowerCase();
    // Clear previous timeout
    clearTimeout(searchTimeout);
    // Apply filter

    filterTable(typedSearch);
    // Reset search string after 1.5 seconds of no typing

    searchTimeout = setTimeout(() => {
      typedSearch = '';
    }, 1500);
  })

  function filterTable(searchTerm) {
    if (searchTerm.trim() === '') {
      filteredData = [...originalData];
    } else {
      filteredData = originalData.filter(coin => {
        return (
          (coin.name && coin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (coin.symbol && coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }
    currentPage = 1;
    renderTableBody(filteredData);
    CreatePegination()
  }

  createTable()
  renderTableBody(filteredData);
  attachFavToggle();
  addTableHeader()
  CreatePegination()

});

// async function getNewsInfo(cryptocurrency) {
//   // return [
//   //   { "title": "air india", "description": "If you’ve flown recently, you have probably made the same observation I have: No one pays attention to the pre-flight safety videos. There may be the occasional uptick in interest after a well-publicized crash or near-disaster, but soon old habits return—peop…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
//   //   { "title": " indigo", "description": "Singapore Airlines (SIA) has embarked on a significant renovation of its SilverKris and KrisFlyer Gold lounges at Changi Airport Terminal…\nThe post Singapore Airlines Terminal 2 Lounges at Changi Airport Getting a Makeover appeared first on Points Miles and B…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
//   //   { "title": "indigo", "description": "Airline Partners With MicroTau to Install ‘Shark Skin’ Riblets on Its B767s In an effort to cut fuel consumption and improve sustainability, Delta Airlines has announced a partnership with MicroTau to install ‘shark skin’ riblets on its jets. The technology i…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
//   //   { "title": "indigo", "description": "Fotografi-simulator till Xbox och PC\n\nNu har Annapurna Interactive släppt Matt Newells Lushfoil Photography Sim, en simulatorupplevelse som går ut på att användaren ska gå runt och spela fotograf.\n\nFörutom massa fantastiska miljöer att fotografera …", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" }
//   // ]
//   try {
//     const queryParams = new URLSearchParams({
//       from: "2025-04-16",
//       to: "2025-04-16",
//       sortBy: "relevancy",
//       apiKey: NEWS_API_KEY,
//       q: cryptocurrency,
//       language: "en",
//       excludeDomains: "slickdeals.net",
//       pageSize: 1,
//     });

//     const URL = `https://newsapi.org/v2/everything?${queryParams.toString()}`;
//     const response = await fetch(URL);
//     const resp = await response.json();

//     console.log(resp);

//     const articles = resp?.articles || [];
//     const newsData = articles.map((article) => ({
//       title: article.title,
//       description: article.description,
//       url: article.url,
//       urlToImage: article.urlToImage,
//     }));

//     return newsData;
//   } catch (e) {
//     console.log("Error fetching news:", e);
//     return [];
//   }
// }


// let newsData = [
//   { "title": "air india", "description": "If you’ve flown recently, you have probably made the same observation I have: No one pays attention to the pre-flight safety videos. There may be the occasional uptick in interest after a well-publicized crash or near-disaster, but soon old habits return—peop…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/600x400" },
//   // { "title": " indigo", "description": "Singapore Airlines (SIA) has embarked on a significant renovation of its SilverKris and KrisFlyer Gold lounges at Changi Airport Terminal…\nThe post Singapore Airlines Terminal 2 Lounges at Changi Airport Getting a Makeover appeared first on Points Miles and B…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/400x200" },
//   // { "title": "indigo", "description": "Airline Partners With MicroTau to Install ‘Shark Skin’ Riblets on Its B767s In an effort to cut fuel consumption and improve sustainability, Delta Airlines has announced a partnership with MicroTau to install ‘shark skin’ riblets on its jets. The technology i…", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/400x200" },
//   // { "title": "indigo", "description": "Fotografi-simulator till Xbox och PC\n\nNu har Annapurna Interactive släppt Matt Newells Lushfoil Photography Sim, en simulatorupplevelse som går ut på att användaren ska gå runt och spela fotograf.\n\nFörutom massa fantastiska miljöer att fotografera …", "url": "https://www.aero-news.net/index.cfm?do=main.textpost&id=3C61F097-6D57-4CDB-8D09-CD51A8D31E5C", "urlToImage": "https://placehold.co/400x200" }
// ]

// async function genNewsInfo() {
//   const newsContainer = document.querySelector('.news');
//   // const cryptocurrency = 'cryptocurrency'; // or whatever search term you want
//   // const newsData = await getNewsInfo(cryptocurrency);
//   let newsHTML = '';
//   newsData.forEach((item) => {
//     newsHTML += `<div class=" news-container">
//     <h2>NEWS</h2>
//       <img class="news-image" src="${item.urlToImage}"/>
//                     <div class="news-content">
//                         <div class="news-title"> <a href="${item.url}">${item.title}</a></div>
//                         <p>${item.description}</p>
//                     </div>
//     </div>`
//   })
//   newsContainer.innerHTML = newsHTML;
// }

// genNewsInfo();




