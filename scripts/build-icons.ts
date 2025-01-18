import sharp from 'sharp';

const sizes = [16, 48, 128];

sizes.forEach(size => {
  sharp('../drafts/icon-v2.svg')
    .resize(size, size)
    .toFile(`icon-${size}.png`);
});