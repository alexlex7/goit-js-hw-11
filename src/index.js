// import SimpleLightbox from 'simplelightbox/dist/simple-lightbox';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.2.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btn: document.querySelector('.load-more'),
};
let gallery = new SimpleLightbox('.gallery a');
let currentPage = 1;
let totalPages = 0;

refs.searchForm.addEventListener('submit', onSubmitHandler);
refs.btn.addEventListener('click', loadMore);
window.addEventListener('scroll', handleScroll);

function onSubmitHandler(e) {
  e.preventDefault();
  refs.btn.setAttribute('hidden', '');
  refs.gallery.innerHTML = '';
  fetchImages();
  refs.btn.removeAttribute('hidden');
}

function fetchImages() {
  const { value } = refs.searchForm.elements.searchQuery;
  const API_KEY = '25182947-9cfc659c765cf87b0696ff639';
  const hitsPerPage = 40;

  return fetch(
    `https://pixabay.com/api/?key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${hitsPerPage}&min_height='360'`
  )
    .then(response => response.json())
    .then(({ hits, totalHits }) => {
      totalPages = Math.round(totalHits / hitsPerPage);
      if (currentPage === 1 && totalHits > 0) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
      }
      renderGallery(hits);
    });
}

function renderGallery(hits) {
  if (hits.length === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  const items = hits.map(
    ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
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
    }
  );

  refs.gallery.insertAdjacentHTML('beforeend', items.join(''));
  gallery.refresh();
  smoothScroll();
  handleScroll();
}

function loadMore() {
  currentPage++;
  if (currentPage === totalPages) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.btn.setAttribute('hidden', '');
  }

  fetchImages();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

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

// function enableInfinityScroll() {
//   const options = {
//     root: document.querySelector('body'),
//   };
//   const handleObserver = e => {
//     console.log(e);
//     loadMore();
//   };
//   const observer = new IntersectionObserver(handleObserver, options);

//   observer.observe(refs.btn);
// }
