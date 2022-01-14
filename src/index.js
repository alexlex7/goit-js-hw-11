import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.2.min.css';
import axios from 'axios';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btn: document.querySelector('.load-more'),
};
let gallery = new SimpleLightbox('.gallery a');
let currentPage = 1;
let totalPages = 0;
const itemTemplate = ({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => {
  return `
    <div class="photo-card">
        <a href=${largeImageURL}>
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b>${likes}</p>
          <p class="info-item"><b>Views</b>${views}</p>
          <p class="info-item"><b>Comments</b>${comments}</p>
          <p class="info-item"><b>Downloads</b>${downloads}</p>
        </div>
      </div>
    `;
};

refs.searchForm.addEventListener('submit', onSubmitHandler);
refs.btn.addEventListener('click', loadMore);
window.addEventListener('scroll', handleScroll);

async function onSubmitHandler(e) {
  e.preventDefault();
  currentPage = 1;
  totalPages = 0;
  refs.btn.setAttribute('hidden', '');
  refs.gallery.innerHTML = '';
  const hits = await fetchImages();
  renderGallery(hits);
  refs.btn.removeAttribute('hidden');
}

async function fetchImages() {
  const SEARCH_URL = 'https://pixabay.com/api/';
  const { value } = refs.searchForm.elements.searchQuery;
  const hitsPerPage = 40;
  const params = new URLSearchParams({
    key: '25182947-9cfc659c765cf87b0696ff639',
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: hitsPerPage,
  });

  const response = await axios(`${SEARCH_URL}?${params.toString()}`);

  const { hits, totalHits } = await response.data;
  totalPages = Math.round(totalHits / hitsPerPage);
  if (currentPage === 1 && totalHits > 0) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  return hits;
}

function renderGallery(hits) {
  if (hits.length === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  const items = hits.map(item => itemTemplate(item));

  refs.gallery.insertAdjacentHTML('beforeend', items.join(''));
  gallery.refresh();
  smoothScroll();
  handleScroll();
}

async function loadMore() {
  currentPage++;
  if (currentPage === totalPages) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.btn.setAttribute('hidden', '');
  }

  const hits = await fetchImages();
  renderGallery(hits);
}

function smoothScroll() {
  window.scrollBy({
    top: '70',
    behavior: 'smooth',
  });
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5 && currentPage < totalPages) {
    loadMore();
  }
}
