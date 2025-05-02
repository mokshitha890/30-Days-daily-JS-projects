async function loadData() {
    try {
        const response = await fetch('./data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
}

function renderFavorites(favData, favorites) {
    const container = document.getElementById('fav-table-container');
    if (!favData.length) {
        container.innerHTML = "<p>No favorites selected.</p>";
        return;
    }

    const keys = Object.keys(favData[0]);
    favData.forEach(obj => {
        delete obj.logo
    });
    let tableHeaders = keys.map(k => `<th>${k.replace(/_/g, ' ').toLowerCase()}</th>`).join('');

    tableHeaders = `<th>fav</th>` + tableHeaders;
    let tableRows = favData.map(coin => {
        const isFav = favorites.has(coin.symbol);
        const starIcon = isFav ? 'star-solid.svg' : 'star-regular.svg';

        const starCell = `<td class="fav-coin" ><img src="./coins-logo/${starIcon}" 
                              style="height:20px; cursor:pointer;" 
                              id="fav-icon"
                              data-symbol="${coin.symbol}" /></td>`;

        const dataCells = keys.map(k => `<td>${coin[k]}</td>`).join('');

        return `<tr>${starCell}${dataCells}</tr>`;
    }).join('');

    container.innerHTML = `
      <table class="crypto-table table table-hover align-middle text-center">
        <thead class="table-light px-2" style="cursor: pointer; padding: 10px;"><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    container.querySelectorAll('#fav-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const symbol = e.target.dataset.symbol
            favorites.delete(symbol)
            localStorage.setItem('favorites', JSON.stringify([...favorites]));


            loadData().then(data => {
                const favData = data.filter(coin => favorites.has(coin.symbol));
                renderFavorites(favData, favorites);
            });
        })
    })
}




window.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
    let favData = data.filter(coin => favorites.has(coin.symbol));
    renderFavorites(favData, favorites);
});
