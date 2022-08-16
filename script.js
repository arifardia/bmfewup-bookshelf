const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function addBook() {
  const generatedID = +new Date();
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById("inputBookIsCompleted").checked;

  const bookObject = generateBookObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function makeBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis : " + bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun : " + bookObject.year;

  const bookContainer = document.createElement("div");
  bookContainer.classList.add("bookItem");
  bookContainer.append(bookTitle, bookAuthor, bookYear);
  const container = document.createElement("article");
  container.classList.add("bookItems");
  container.append(bookContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const checkButton = document.createElement("button");
  checkButton.classList.add("checkButton");
  checkButton.addEventListener("click", function () {
    addBookToCompleted(bookObject.id);
  });

  const undoButton = document.createElement("button");
  undoButton.classList.add("undoButton");
  undoButton.addEventListener("click", function () {
    undoBookFromCompleted(bookObject.id);
  });

  const trashButton = document.createElement("button");
  trashButton.classList.add("trashButton");
  trashButton.addEventListener("click", function () {
    if (confirm("Hapus Buku?")) {
      removeBookFromCompleted(bookObject.id);
    } else {
      return;
    }
  });

  if (bookObject.isCompleted) {
    buttonContainer.append(undoButton, trashButton);
    container.append(buttonContainer);
  } else {
    buttonContainer.append(checkButton, trashButton);
    container.append(buttonContainer);
  }
  return container;
}

function deleteForm() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsCompleted").checked = false;
}

function addBookToCompleted(bookId) {
  const BookTarget = findBook(bookId);

  if (BookTarget == null) return;

  BookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return -1;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser yang kamu gunakan tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function bookSearch(keyword) {
  const searchTitle = document.getElementsByTagName("h3");
  const searchInput = keyword.toLowerCase();

  for (let i = 0; i < searchTitle.length; i++) {
    const titlesText = searchTitle[i].textContent || searchTitle[i].innerText;

    if (titlesText.toLowerCase().indexOf(searchInput) >= 0) {
      searchTitle[i].closest(".bookItems").style.display = "";
    } else {
      searchTitle[i].closest(".bookItems").style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const inputBook = document.getElementById("inputBook");
  inputBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    deleteForm();
  });
  const formSearch = document.getElementById("searchBook");
  formSearch.addEventListener("submit", function (event) {
    event.preventDefault();

    const inputSearch = document.getElementById("searchBookTitle").value;
    bookSearch(inputSearch);
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  incompleteBookshelfList.innerHTML = "";

  const completeBookShelfList = document.getElementById("completeBookshelfList");
  completeBookShelfList.innerHTML = "";
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookShelfList.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});
