import axios from 'axios';
import Notiflix from 'notiflix';

export function renderMarkup(html, where, galleryRef) {
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
}
export async function fetchPhotos(params, URL) {
  const response = await axios.get(URL, { params });
  const responseDataHits = await response.data.hits;
  const responseTotalHits = await response.data.totalHits;
  const responseLength = await responseDataHits.length;
  return { responseDataHits, responseLength, responseTotalHits };
}
export function checksTheEnd(currentPage, availablePages, loadMoreRef) {
  if (currentPage === availablePages) {
    loadMoreRef.classList.add('invisible');
    console.log(loadMoreRef);
    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
  }
}

export async function scrollRender(params, availablePages, URL, galleryRef, loadMoreRef) {
  console.log('hey');
  if (
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight &&
    params.page < availablePages
  ) {
    params.page += 1;
    const { responseDataHits } = await fetchPhotos(params, URL);
    const rendering = await renderMarkup(responseDataHits, 'beforeend', galleryRef);
    let gallery = new SimpleLightbox('.gallery a ');
    checksTheEnd(params.page, availablePages, loadMoreRef);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

export async function onLoadMore(params, URL, galleryRef, availablePages, loadMoreRef) {
  params.page += 1;
  const { responseDataHits } = await fetchPhotos(params, URL);
  const rendering = await renderMarkup(responseDataHits, 'beforeend', galleryRef);
  checksTheEnd(params.page, availablePages, loadMoreRef);
  let gallery = new SimpleLightbox('.gallery a ');
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
