import './sass/main.scss';
import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import debounce from 'lodash.debounce';
import { renderMarkup, fetchPhotos, checksTheEnd, scrollRender, onLoadMore } from './axios';
console.log(fetchPhotos);
const URL = 'https://pixabay.com/api/';
const key = '27157182-78441902fcb5ec82df186427b';
const formRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');

const loadMoreRef = document.querySelector('#loading');

async function onSubmitClick(event) {
  event.preventDefault();
  const q = event.currentTarget.elements.searchQuery.value.trim();

  if (!q) {
    Notiflix.Notify.failure('The input is empty');
  } else {
    galleryRef.innerHTML = '';
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
      const { responseDataHits, responseLength, responseTotalHits } = await fetchPhotos(
        params,
        URL,
      );
      const availablePages = Math.ceil(responseTotalHits / 50);
      if (responseLength > 0) {
        renderMarkup(responseDataHits, 'afterbegin', galleryRef);
        loadMoreRef.classList.remove('invisible');
        let gallery = new SimpleLightbox('.gallery a ');
        checksTheEnd(params.page, availablePages, loadMoreRef);
        Notiflix.Notify.success(`Hooray! We found ${responseTotalHits} images.`);
        window.addEventListener(
          'scroll',
          debounce(() => scrollRender(params, availablePages, URL, galleryRef, loadMoreRef), 500),
        );
        loadMoreRef.addEventListener('click', () =>
          onLoadMore(params, URL, galleryRef, availablePages, loadMoreRef),
        );
      } else Notiflix.Notify.failure('No matches');
    } catch (error) {
      console.log(error);
    }
  }
}
formRef.addEventListener('submit', onSubmitClick);
