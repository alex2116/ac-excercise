const BASE_URL = 'https://movie-list.alphacamp.io' //以後若有變更，改這邊就好了
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = 'https://movie-list.alphacamp.io/posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const listViewButton = document.querySelector("#list-button")
const listGroup = document.querySelector(".list-group")
const cardViewButton = document.querySelector("#card-button")


const cardContent = []

let filteredMovies = [] 
let pageOfContent = ""

let viewType = "card"

function renderMovieCard(data) {  
  let rawHTML = ""  
  data.forEach((item) => {  
    console.log(item); 
    rawHTML += `    
      <div class="col-sm-3"> <!-- 大小 col-sm-3 col有12個-->
        <div class="mb-2"> <!-- mb:marginbottom -->
          <div class="card">
            <img
              src="${POSTER_URL + item.image}" alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#MovieModal" data-id ="${item.id}"><!-- id只有一個 用class可以套用到所有按鈕（如果會有很多項）primary為顏色 -->
              More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id ="${item.id}">+</button>
              <!-- data-toggle="modal"跳出modal data-target="#MovieModal" 導向#MovieModal -->
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderToList(data) {

  let rawHTML = ""
  data.forEach((item) => {
    console.log(item)
    rawHTML += `
          <li class="list-group-item
                  border-right-0 border-left-0
                  d-flex
                  justify-content-between
                  align-items-center
                  font-weight-bold">${item.title}
          <span>
            <button class="btn btn-primary btn-show-movie-list" data-toggle="modal" data-target="#MovieModal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite-list" data-id="${item.id}">+</button>
          </span>
        </li>
  `
  })

  listGroup.innerHTML = rawHTML  

}

function viewMode() {
  const movieData = getMoviesByPage(pageOfContent);
  viewType === "card" ? renderMovieCard(movieData) : renderToList(movieData);
  console.log(movieData)
}


function renderPaginator(amount) { 
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)  
  let rawHTML = ""

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`  
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {  
  const data = filteredMovies.length ? filteredMovies : cardContent  
  const startIndex = (page - 1) * MOVIES_PER_PAGE  
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) 

}

function showMovieModal(id) {  
  const modalImage = document.querySelector("#movie-modal-image")
  const modalTitle = document.querySelector(".movie-modal-title")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + id)
    .then(function (response) {
      console.log(response);
      const data = response.data.results;
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="Movie Poster"></img>`
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date: ' + data.release_date
      modalDescription.innerText = data.description
    })
    .catch(function (error) {
      console.log(error);
    })
}

function addToFavorite(id) { 

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []  
  const movie = cardContent.find((movie) => movie.id === id) 

  if (list.some(movie => movie.id === id)) {  
    return alert('此電影已經在收藏清單中')
  }

  list.push(movie)  
  console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))  

  console.log(movie)
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return  
  const page = Number(event.target.dataset.page)  
  pageOfContent = page
  console.log(pageOfContent)
  //renderMovieCard(getMoviesByPage(page))

  viewMode()
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = cardContent.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keywords: ' + keyword)
  }

  pageOfContent = 1

  renderPaginator(filteredMovies.length)
  // renderMovieCard(getMoviesByPage(1))
  viewMode()
})

dataPanel.addEventListener("click", function onPanelClicked(event) { 
  if (event.target.matches(".btn-show-movie")) {  
    showMovieModal(Number(event.target.dataset.id))  
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))  
  }
})

listGroup.addEventListener("click", function onListGroupClicked(event) {
  if (event.target.matches(".btn-show-movie-list")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite-list')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


listViewButton.addEventListener('click', function renderList(event) {  
 viewType = "list"
 dataPanel.innerHTML = ""
 viewMode()
})

cardViewButton.addEventListener('click', function renderList(event) { 
  viewType = "card"
  listGroup.innerHTML = ""
  viewMode()
})


axios.get(INDEX_URL)  
  .then(function (response) {
    console.log(response);
    cardContent.push(...response.data.results)  
    renderPaginator(cardContent.length)  
    renderMovieCard(getMoviesByPage(1))
    pageOfContent = 1
  })
  .catch(function (error) {
    console.log(error);
  }) 



 