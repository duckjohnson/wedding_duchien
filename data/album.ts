export type AlbumBackground = 'green' | 'plain';

export type AlbumPhoto = {
  id: string;
  publicId: string;
  alt: string;
  background: AlbumBackground;
};

/**
 * 11 ảnh album cưới trên Cloudinary (cloud name: txyieslq).
 * Phân loại:
 * - green: nền cây xanh, bãi cỏ, rừng thông, vườn cây ngoài trời hoặc khung kính nhìn ra vườn xanh
 * - plain: studio phông trơn trắng/xám, nội thất phòng gỗ
 */
export const rawAlbumPhotos: AlbumPhoto[] = [
  {
    id: 'photo-1',
    publicId: 'v1790346962/ZHUN3523.jpg',
    alt: 'Ảnh cưới ngoài trời rặng cây xanh',
    background: 'green',
  },
  {
    id: 'photo-2',
    publicId: 'v1790346972/ZHUN3632.jpg',
    alt: 'Ảnh cưới bãi cỏ xanh',
    background: 'green',
  },
  {
    id: 'photo-3',
    publicId: 'v1790346978/ZHUN3690.jpg',
    alt: 'Ảnh cưới lối đi rừng thông xanh',
    background: 'green',
  },
  {
    id: 'photo-4',
    publicId: 'v1790346990/ZHUN3739.jpg',
    alt: 'Ảnh cưới hàng cây xanh cao vút',
    background: 'green',
  },
  {
    id: 'photo-5',
    publicId: 'v1790346993/ZHUN4242.jpg', // Bỏ crop 4:3 cứng cũ c_fill,g_face,ar_4:3
    alt: 'Ảnh cưới studio phông trơn thanh lịch',
    background: 'plain',
  },
  {
    id: 'photo-6',
    publicId: 'v1790346996/ZHUN3846.jpg',
    alt: 'Ảnh cưới vườn xanh trùm khăn voan',
    background: 'green',
  },
  {
    id: 'photo-7',
    publicId: 'v1790346998/ZHUN4246.jpg',
    alt: 'Ảnh cưới studio váy xòe tinh tế',
    background: 'plain',
  },
  {
    id: 'photo-8',
    publicId: 'v1790347000/ZHUN4251.jpg',
    alt: 'Ảnh cưới studio tối giản hiện đại',
    background: 'plain',
  },
  {
    id: 'photo-9',
    publicId: 'v1790347007/ZHUN4427.jpg',
    alt: 'Ảnh cưới cửa kính lớn hướng ra vườn cây xanh',
    background: 'green',
  },
  {
    id: 'photo-10',
    publicId: 'v1790347010/ZHUN4461.jpg',
    alt: 'Ảnh cưới phòng studio tường gỗ',
    background: 'plain',
  },
  {
    id: 'photo-11',
    publicId: 'v1790347015/ZHUN4484.jpg',
    alt: 'Ảnh cưới nội thất phòng gỗ ấm áp',
    background: 'plain',
  },
];

/**
 * Hàm xen kẽ 2 nhóm ảnh green và plain.
 * Nhóm có số lượng nhiều hơn sẽ bắt đầu trước; nếu một nhóm hết trước thì dồn phần còn lại xuống cuối.
 * Giữ nguyên thứ tự tương đối ban đầu trong mỗi nhóm.
 */
export function interleaveByBackground(photos: AlbumPhoto[]): AlbumPhoto[] {
  const greens = photos.filter((p) => p.background === 'green');
  const plains = photos.filter((p) => p.background === 'plain');

  const firstList = greens.length >= plains.length ? greens : plains;
  const secondList = greens.length >= plains.length ? plains : greens;

  const result: AlbumPhoto[] = [];
  const maxLen = Math.max(firstList.length, secondList.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < firstList.length) result.push(firstList[i]);
    if (i < secondList.length) result.push(secondList[i]);
  }

  return result;
}

export const CLOUDINARY_CLOUD_NAME = 'txyieslq';

export function getAlbumImageUrl(
  publicId: string,
  options: {
    width?: number;
    aspectRatio?: string;
    crop?: string;
    gravity?: string;
  } = {},
): string {
  const { width = 900, aspectRatio = '3:4', crop = 'c_fill', gravity = 'g_faces' } = options;
  const transforms = [crop, gravity, `ar_${aspectRatio}`, `w_${width}`, 'f_auto', 'q_auto'].join(',');
  return `https://res.cloudinary.com/txyieslq/image/upload/${transforms}/${publicId}`;
}

export function getFullImageUrl(publicId: string): string {
  return `https://res.cloudinary.com/txyieslq/image/upload/w_1600,f_auto,q_auto/${publicId}`;
}

export const albumPhotos: AlbumPhoto[] = interleaveByBackground(rawAlbumPhotos);
