let gamesData;
let selectData;
const gms = document.getElementById('gms');
const gamesBox = document.getElementById('games-box');
const filterBar = document.getElementById('filter-bar');
const selectList = document.getElementsByTagName('select');
const themeButton = document.getElementById('theme-button');
const addGameButton = document.getElementById('add-game-button');

const darkCSS = document.createElement('link');
darkCSS.rel = 'stylesheet';
darkCSS.href = '/css/styles_dark.css';

if (getCookie('theme') == undefined) setCookie('theme', 'light', 365);
if (getCookie('theme') == 'dark') {
    document.head.appendChild(darkCSS);
    if (themeButton != null) themeButton.innerText = 'light_mode';
}

init();

if (filterBar != null) {
    for (const filter of filterBar.children) {
        filter.addEventListener('change', () => filterGameCards());
    }
}

if (themeButton != null) {
    themeButton.addEventListener('click', () => changeTheme());
}

if (addGameButton != null) {
    addGameButton.addEventListener('click', () => showFormFrame('new'));
}


/**
 * Initialization function.
 * Loads game data and selects data, calls loading games cards function and fill <select> tags with options.
 */
async function init() {
    const gamesDataResult = await fetch('/api/games_list');
    const selectDataResult = await fetch('../json/select_data.json');
    gamesData = await gamesDataResult.json();
    selectData = await selectDataResult.json();

    if (gamesBox != null) loadGameCards(gamesData);

    for (const select of selectList) {
        const optionList = selectData[select.getAttribute('data')];
        for (const option in optionList) {
            const optionNode = document.createElement('option');
            optionNode.value = option;
            optionNode.innerText = optionList[option];
            select.appendChild(optionNode);
        }
    }
}

function showFormFrame(gameId) {
    const curtain = document.createElement('div');
    const frame = document.createElement('iframe');
    curtain.id = 'curtain';
    frame.id = 'frame';
    frame.src = window.location.href + 'edit_game.html' + `?id=${gameId}`;
    curtain.appendChild(frame);
    gms.appendChild(curtain);
}

/**
 * Creates game cards and fills gamesBox with them.
 * @param {JSON} data - Games data stored in JSON format.
 */
async function loadGameCards(data) {
    for (const item of data) {

        let imgCover;
        if (item.img_cover && item.img_cover.data) {
            imgCover = new Blob([new Uint8Array(item.img_cover.data)], {type: "image/png"});
            imgCover = URL.createObjectURL(imgCover);
        } else {
            imgCover = "img/placeholder.png";
        } 

        let achievsPercent = Math.round((item.achievs_completed/item.achievs_all)*100);
        if (isNaN(achievsPercent)) { achievsPercent = '---'; }

        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');
        gameCard.innerHTML = `
        <img src="${imgCover}" />
        <div class="game-info">
            <div title="${item.title}">${item.title}</div>
            <div>
                <div>
                    <span class="status-icon ${selectData["status_color"][item.status]}"></span>
                    <span>${selectData["status"][item.status]}</span>
                </div>
                <div>
                    <span class="material-symbols-outlined">trophy</span>
                    <span>${achievsPercent + "%"}</span>
                </div>
            </div>
            <div>
                <progress min="0" max="100" value="${item.completion}"></progress>
                <span>${item.completion}%</span>
            </div>
        </div>`;
        gamesBox.appendChild(gameCard);
    }
}

/**
 * Filters games data, clears games box and fill it with new cards.
 */
function filterGameCards() {
    let filteredData = gamesData;

    for (let filter of filterBar.children) {
        if (filter.tagName == 'LABEL') filter = filter.firstChild;
        if (!filter.value) continue;

        if (filter.type == 'search') {
            filteredData = filteredData.filter(item => item.title.toLowerCase().includes(filter.value.toLowerCase()));
        } else if ((filter.type == 'checkbox' && filter.checked) || filter.tagName == 'SELECT') {
            filteredData = filteredData.filter(item => item[filter.getAttribute('data')] == filter.value);
        }
    }

    gamesBox.replaceChildren();
    loadGameCards(filteredData);
}

/**
 * Adds/removes dark CSS link tag to head of the document and changes cookie.
 */
function changeTheme() {
    const theme = getCookie('theme');
    theme == 'light' ? document.head.appendChild(darkCSS) : document.head.removeChild(darkCSS);
    themeButton.innerText = theme == 'light' ? 'light_mode' : 'dark_mode';

    const newTheme = getCookie('theme') == 'light' ? 'dark' : 'light';
    setCookie('theme', newTheme, 365);
}

/**
 * Sets new cookie.
 * @param {String} cname - Cookie's name.
 * @param {String} cvalue - Cookie's value.
 * @param {Integer} expirationDays - Number of experation days.
 */
function setCookie(cname, cvalue, expDays) {
    const date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    document.cookie = cname + '=' + cvalue + ';' + 'expires=' + date.toUTCString + 'path=/';
}

/**
 * Gets chosen cookie.
 * @param {String} name - Cookie's name.
 * @returns {String} - Cookie's value.
 */
function getCookie(name) {
    let cookies = Object.fromEntries(
        document.cookie.split(';').map(c => {
            let [key, val] = c.split('=');
            return [key.trim(), val];
        })
    );

    return cookies[name];
}