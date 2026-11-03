import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortContent, extractUniqueGenres, validateAccessCode, formatBytes, isValidVideoFormat } from './streaming';

test('validateAccessCode identifies master code 2514 correctly', () => {
  const result = validateAccessCode('2514', '2513', '2514');
  assert.equal(result.valid, true);
  assert.equal(result.isMaster, true);
});

test('validateAccessCode identifies standard staff code correctly', () => {
  const result = validateAccessCode('2513', '2513', '2514');
  assert.equal(result.valid, true);
  assert.equal(result.isMaster, false);
});

test('validateAccessCode rejects invalid codes', () => {
  const result = validateAccessCode('0000', '2513', '2514');
  assert.equal(result.valid, false);
  assert.equal(result.isMaster, false);
});

test('extractUniqueGenres extracts distinct alphabetical genres', () => {
  const sampleItems = [
    { id: '1', title: 'Movie A', releaseYear: 2024, averageRating: 4.5, genres: ['Action', 'Sci-Fi'] },
    { id: '2', title: 'Movie B', releaseYear: 2025, averageRating: 4.8, genres: ['Comedy', 'Action'] }
  ];
  const genres = extractUniqueGenres(sampleItems);
  assert.deepEqual(genres, ['Action', 'Comedy', 'Sci-Fi']);
});

test('filterAndSortContent filters by genre and sorts by rating', () => {
  const sampleItems = [
    { id: '1', title: 'Low Rating Sci-Fi', releaseYear: 2024, averageRating: 3.2, genres: ['Sci-Fi'] },
    { id: '2', title: 'High Rating Sci-Fi', releaseYear: 2025, averageRating: 4.9, genres: ['Sci-Fi'] },
    { id: '3', title: 'Action Film', releaseYear: 2026, averageRating: 4.0, genres: ['Action'] }
  ];

  const filtered = filterAndSortContent(sampleItems, 'Sci-Fi', 'rating');
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].title, 'High Rating Sci-Fi');
  assert.equal(filtered[1].title, 'Low Rating Sci-Fi');
});

test('isValidVideoFormat validates mp4, mkv, mov, and webm files', () => {
  assert.equal(isValidVideoFormat('movie.mp4', 'video/mp4'), true);
  assert.equal(isValidVideoFormat('movie.MP4'), true);
  assert.equal(isValidVideoFormat('intro.mkv'), true);
  assert.equal(isValidVideoFormat('clip.mov'), true);
  assert.equal(isValidVideoFormat('video.webm', 'video/webm'), true);
  assert.equal(isValidVideoFormat('image.jpg', 'image/jpeg'), false);
  assert.equal(isValidVideoFormat('document.pdf'), false);
});

test('formatBytes correctly formats file sizes from MB to GB', () => {
  assert.equal(formatBytes(0), '0 Bytes');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576 * 50), '50 MB');
  assert.equal(formatBytes(1073741824 * 2.5), '2.5 GB');
});
