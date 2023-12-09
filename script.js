const container = document.querySelector(".container")
let favList = JSON.parse(localStorage.getItem('favoriteUsers')) || []

// 渲染主畫面
function renderUserList(data) {
  let rawHTML = ""
  //已在最愛清單則愛心is pink
  const map = {}
  for (const e of favList) {
    map[e.id] = e
  }

  data.forEach((item) => {

    let pinkOrNot = ''
    if (!map[item.id]) {
      pinkOrNot = 'far'
    }
    else pinkOrNot = 'fas'

    rawHTML += `
      <div class="card">
      <img class="card-img-top" src="${item.avatar}" alt="Card image cap" data-bs-toggle="modal" data-bs-target="#modal${item.id}" data-id="${item.id}">
      <div class="card-body d-flex justify-content-around">
        <h5 class="card-title">${item.name} ${item.surname}</h5>
        <i class="${pinkOrNot} fa-heart" data-id="${item.id}" id="heartId"></i>
      </div>
    </div>
      `
  })
  container.innerHTML = rawHTML
}

//ＡＰＩ拉資料，先啟動分頁器再渲染畫面
const apiUrl = "https://user-list.alphacamp.io/api/v1/users"
const users = []
axios
  .get(apiUrl)
  .then((response) => {
    users.push(...response.data.results)
    users.forEach((item) => { })
    renderPaginator(users.length)
    renderUserList(getUserByPage(users, 1))
  })
  .catch((err) => console.log(err))

//ㄇ
async function showimageModal(id) {
  const modalFade = document.querySelector(".modal.fade")
  const modalTitle = document.querySelector("#user-modal-title")
  const modalImage = document.querySelector("#user-modal-image")
  const modalDescription = document.querySelector("#user-modal-description")
  const response = await axios.get(apiUrl + "/" + id)
  const data = response.data;
  modalFade.setAttribute("id", `modal${data.id}`)
  modalTitle.innerText = `${data.name} ${data.surname}`
  modalDescription.innerHTML = `
       <ul class="card-text">
          <li>email: ${data.email}</li>
          <li>region: ${data.region}</li>
          <li>birthday: ${data.birthday}</li>
        </ul>
    `;
  modalImage.innerHTML = `<img src=${data.avatar} alt="user-avatar" class="img-fluid">`
}

const title = document.querySelector('#title')

//按大頭跑出modal & 愛心變化
container.addEventListener("click", async function(event) {
  console.log("debug target: ", event.target)
  if (event.target.classList.contains("card-img-top")) {
    await showimageModal(event.target.dataset.id);
  }
  //按愛心加入、移除最愛清單
  if (event.target.matches('.fa-heart.far')) {
    addToFavorite(event.target)
  } else if (event.target.classList.contains('fas')) {
    removeFromFavorite(event.target)
    if (title.classList.contains("title")) renderFavList()
  }
});

//增加分頁器樣式
const paginator = document.querySelector('#paginator')
const userPerPage = 12
function renderPaginator(totalDataAmout) {
  const numberOfPages = Math.ceil(totalDataAmout / userPerPage)
  let rawHTML = ''
  for (let i = 1; i <= numberOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
//分頁器功能，按頁數 更新網頁畫面
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const currentPage = Number(event.target.dataset.page)
  const favTitle = document.querySelector('#fav-title')
  if (!favTitle.innerText) renderUserList(getUserByPage(users, currentPage))
  else renderUserList(getUserByPage(favList, currentPage))
})

//將所有user資料分頁，看每頁有多少位
function getUserByPage(data, currentPage) {
  const startIndex = (currentPage - 1) * userPerPage
  return data.slice(startIndex, startIndex + userPerPage)
}

//新增最愛新單、愛心變粉色
function addToFavorite(target) {
  addToLocalStorage(Number(target.dataset.id))
  target.classList.remove('far')
  target.classList.add('fas')
}
//新增到logalStorage
function addToLocalStorage(id) {
  const thisUser = users.find((thisUser) => thisUser.id === id)
  favList.push(thisUser)
  localStorage.setItem('favoriteUsers', JSON.stringify(favList))
}

//從最愛清單移除、愛心變回白色
function removeFromFavorite(target) {
  removeFromLocalStorage(Number(target.dataset.id))
  target.classList.remove('fas')
  target.classList.add('far')
}
// 從localStorage移除
function removeFromLocalStorage(id) {
  const userIndex = favList.findIndex((user) => user.id === id)
  favList.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(favList))
}

const showFavButton = document.querySelector("#show-fav")
const favTitle = document.querySelector('#fav-title')
const instruction = document.querySelector('.instruction')
//監聽favButton
showFavButton.addEventListener('click', () => {
  if (favList.length === 0) {
    alert('Favorite List is Empty！')
    return
  }
  renderFavList()
  instruction.innerHTML = `
    <li> click on robot's AVATAR to see more info abouth this cutie!</li>
    <li> click <i class="fas fa-heart" style="font-size: 17px;"></i> to add/remove from favorite list</li>
    <li> click on <a href="index.html"> Robot List </a> to see all the robots</li>`
})

//按鈕顯示所有最愛
function renderFavList() {
  favTitle.innerHTML = 'These are My Favorite Robots'
  title.classList.add('title')
  renderPaginator(favList.length)
  renderUserList(getUserByPage(favList, 1))
  addClearButton()
}
// add clear button
function addClearButton() {
  favTitle.innerHTML += '<button id="clear-fav" style="margin-left:20px;">clear <i class="far fa-heart"></i> favorite</button>'
  const clearFav = document.querySelector('#clear-fav')
  clearFav.addEventListener('click', function() {
    localStorage.removeItem("favoriteUsers")
    instruction.innerHTML = `
    <h3>Favorite List is already Empty, <br> please click on <a href="index.html" class="title"> Robot List</a>  to see all the cute robots! </h3>
    <h1>:) </h1>
    `
    container.innerHTML = ''
    paginator.innerHTML = ''
    favList = []
  })
}









