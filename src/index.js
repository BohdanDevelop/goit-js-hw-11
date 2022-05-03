import './sass/main.scss';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

const URL = 'https://pixabay.com/api/';
const key = '27157182-78441902fcb5ec82df186427b';
const formRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');

const loadMoreRef = document.querySelector('#loading');

function renderMarkup(html, where) {
  const markup = html
    .map(element => {
      return `
   <div class="image-card">
   
  <a data-lightbox="images" class="gallery__item"  href="${element.largeImageURL}" >
  <img class="image gallery__image"  src="${element.webformatURL}"  alt="${element.tags}"/>
  </a>
  
  <div class="text-box">
  <div class="text">
  <p class="bold-text">Like</p>
  <p>${element.likes}</p>
  </div>
  <div class="text">
  <p class="bold-text">Views</p>
  <p>${element.views}</p>
  </div>
  <div class="text">
  <p class="bold-text">Comments</p>
  <p>${element.comments}</p>
  </div>
  <div class="text">
  <p class="bold-text">Downloads</p>
  <p>${element.downloads}</p>
  </div>
  </div>
  </div>
 `;
    })
    .join('');
  galleryRef.insertAdjacentHTML(where, markup);
  console.log(document.querySelector('.gallery a'));
}
async function fetchPhotos(params) {
  const response = await axios.get(URL, { params });
  const responseDataHits = await response.data.hits;
  const responseTotalHits = await response.data.totalHits;
  const responseLength = await responseDataHits.length;
  return { responseDataHits, responseLength, responseTotalHits };
}
function checksTheEnd(currentPage, availablePages) {
  if (currentPage === availablePages) {
    loadMoreRef.classList.add('invisible');
    console.log(loadMoreRef);
    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
  }
}
async function onSubmitClick(event) {
  event.preventDefault();
  const q = event.currentTarget.elements.searchQuery.value.trim();
  galleryRef.innerHTML = '';
  if (!q) {
    Notiflix.Notify.failure('The input is empty');
  } else {
    let page = 1;
    const params = {
      key,
      q,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 50,
      page,
    };
    try {
      const { responseDataHits, responseLength, responseTotalHits } = await fetchPhotos(params);
      const availablePages = Math.ceil(responseTotalHits / 50);
      console.log(availablePages);
      if (responseLength > 0) {
        renderMarkup(responseDataHits, 'afterbegin');
        let gallery = new SimpleLightbox('.gallery a ');
        loadMoreRef.classList.remove('invisible');
        checksTheEnd(params.page, availablePages);
        Notiflix.Notify.success(`Hooray! We found ${responseTotalHits} images.`);

        loadMoreRef.addEventListener('click', async () => {
          params.page += 1;
          const { responseDataHits } = await fetchPhotos(params);
          const rendering = await renderMarkup(responseDataHits, 'beforeend');
          checksTheEnd(params.page, availablePages);
        });
      } else Notiflix.Notify.failure('No matches');
    } catch (error) {
      console.log(error);
    }
  }
}
formRef.addEventListener('submit', onSubmitClick);
