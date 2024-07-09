const searchBtn = document.getElementById("search-button")
const inputTextElem = document.getElementById("search-input")
const pokemonResourceEndPt = 'https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/'

const tableNonStatsDataFields = {
    name: document.getElementById("pokemon-name"),
    id: document.getElementById("pokemon-id"),
    weight: document.getElementById("weight"),
    height: document.getElementById("height"),
}

const tableStatsDataFieds = {
    hp: document.getElementById("hp"),
    attack: document.getElementById("attack"),
    defense: document.getElementById("defense"),
    speed: document.getElementById("speed"),
    'special-attack': document.getElementById("special-attack"),
    'special-defense': document.getElementById("special-defense"),
}

const typesElement = document.getElementById("types")
const spriteElement = document.getElementById("sprite")

function readSearchText() {
    return inputTextElem.value
} 

function searchTextToResourceId(text) {
    return (text
                .toLowerCase()
                .replace(/^\s+|\s+$/g, '') // remove leading & trailing whitespace
                .replace(/[^0-9,a-z, ]/g, '') // remove special characters
                .replace(/ /g, '-') // replace space by dash
                + (text.match(/♀/) ? '-f' : '')
                + (text.match(/♂/) ? '-m' : '')
        )
}

async function fetchDataFromResourceId(resId) {
    const fetchUrl = pokemonResourceEndPt + resId
    const response = await fetch(fetchUrl)
    if (!response.ok) {
        throw new Error('Pokemon not found')
    }
    const data = await response.json()
    return data
}

function handleMissingPokemon() {
    window.alert("Pokémon not found")
}

function statsToMap(stats) {
    /* stats: List of objects like:
     {
      "base_stat": 35,
      "effort": 0,
      "stat": {
        "name": "hp",
        "url": "https://pokeapi.co/api/v2/stat/1/"
      }
    }*/
    let statsMap = {}
    stats.forEach(s=>{statsMap[s.stat.name]=s.base_stat})
    return statsMap
}

function typesToArr(types) {
    /* types: List of objects like:
    {
      "slot": 1,
      "type": {
        "name": "electric",
        "url": "https://pokeapi.co/api/v2/type/13/"
      }
    }
    */
    return types.map(t=>t.type.name)
}

function unpackApiData(data) {
    const {name, id, weight, height, types, stats, sprites} = data
    const typesArr = typesToArr(types)
    const statsMap = statsToMap(stats)
    return {name, id, weight, height, typesArr, statsMap, sprites}
}

function renderDataToTableFields(data, fieldsMap) {
    Object.entries(fieldsMap).forEach(
        ([key, elem]) => {
            elem.innerText = data[key]
        }
    )
}

function renderTypes(arr) {
    typesElement.innerHTML = ''
    arr.forEach(t=>typesElement.innerHTML+=`<span class="type">${t}</span>`)
}

function renderImageToSprite(srcUrl) {
    spriteElement.src = srcUrl
}

function renderDataToPage(data) {
    /* input is expected to be unpacked data, from unpackApiData function */
    renderDataToTableFields(data, tableNonStatsDataFields)
    renderDataToTableFields(data.statsMap, tableStatsDataFieds)
    renderTypes(data.typesArr)
    renderImageToSprite(data.sprites.front_default)
}

async function handleSearchBtnClick() {
    const searchTerm = readSearchText()
    const resId = searchTextToResourceId(searchTerm)
    let apiData;
    try {
        apiData = await fetchDataFromResourceId(resId)
    } catch {
        handleMissingPokemon();
        return
    }
    const unpackedData = unpackApiData(apiData)
    renderDataToPage(unpackedData)
}

searchBtn.addEventListener('click', handleSearchBtnClick)