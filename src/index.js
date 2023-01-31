//chrome://extensions/
import axios from "axios";
let urlGrabbedLists = [];

const inputBtn = document.getElementById("input-btn");
const deleteBtn = document.getElementById("delete-btn");
const tabBtn = document.getElementById("tab-btn");
const ulEl = document.getElementById("ul-el");

let urlFromLocalStorage = JSON.parse(localStorage.getItem("myGrabbedLists2"));

// Load URL lists from localStorage
const loadStorge = async () => {
  if (urlFromLocalStorage) {
    urlGrabbedLists = urlFromLocalStorage;

    await setTimeout(() => {
      let loader = document.createElement("div");
      loader.id = "loading";
      let img = document.createElement("img");
      img.id = "loading-image";
      img.src = "spinner_loader.gif";
      img.alt = "Loading...";
      loader.appendChild(img);
      document.getElementById("url-lists").appendChild(loader);
      render(urlGrabbedLists).then(() => {
        document.getElementById("loading").style.display = "none";
      });
    }, 2000);
  }
};

loadStorge();

// Update localStorage
function updateLocalStorage() {
  localStorage.setItem("myGrabbedLists2", JSON.stringify(urlGrabbedLists));
}

// Toast text
function toast(valid) {
  let x = document.getElementById("snackbar");
  x.className = "show";

  if (valid === 1) {
    x.innerHTML = "Saved";
  } else if (valid === 3) {
    x.innerHTML = "url removed.";
  } else {
    x.innerHTML = "Unsaved, Please enter a valid url.";
  }

  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

// Evenlisteners
inputBtn.addEventListener("click", function () {
  const url = document.getElementById("input-el");
  if (url.value) {
    urlGrabbedLists.push(url.value);
    toast(1);
    updateLocalStorage();
    render(urlGrabbedLists);
  } else {
    toast(0);
  }

  url.value = null;
});

deleteBtn.addEventListener("dblclick", function () {
  localStorage.clear();
  urlGrabbedLists = [];
  render(urlGrabbedLists);
  document.getElementById("url-lists").style.display = "none";
});

tabBtn.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    urlGrabbedLists.push(tabs[0].url);
    updateLocalStorage();
    render(urlGrabbedLists);
    toast(1);
  });
});

// Render saved URL lists display in UL
async function render(urls) {
  let listItems = "";
  if (urls.length > 0) {
    document.getElementById("url-lists").style.display = "block";
  } else {
    document.getElementById("url-lists").style.display = "none";
    return;
  }

  // Iteratate list
  for (let i = 0; i < urls.length; i++) {
    const title = await getUrlTitle(urls[i]);
    listItems += `<li><a href=${urls[i]} target="_blank">${title}</a><button id='${i}' class='remove'>remove</button></li>`;
  }

  ulEl.innerHTML = listItems;

  // Add evenlistener to remove button for remove sigle URL
  const removeBtn = document.querySelectorAll(".remove");
  await removeBtn.forEach((item) => {
    item.addEventListener("click", function () {
      if (item.id > -1) {
        urlGrabbedLists.splice(item.id, 1);
      }
      toast(3);
      updateLocalStorage();
      render(urlGrabbedLists);
    });
  });
}

// Use get URL title API to fecth the title of saved URLs
const getUrlTitle = async (url) => {
  const res = await axios.get(
    `https://fetch-url-title-nodejs-native.vercel.app/api/v1/title/?url=${url}`
  );
  return res.data.title;
};
