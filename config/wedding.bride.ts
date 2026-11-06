/* =========================================================
   THIỆP NHÀ GÁI – Vũ Hiền & Hữu Đức
   Các dòng có "TODO" là thông tin tôi chưa biết, BẠN PHẢI TỰ SỬA
   trước khi gửi thiệp cho khách nhà gái.
   ========================================================= */

import type {WeddingConfig} from './wedding.types';

export const weddingBride: WeddingConfig = {
    side: 'bride',

    groom: {
        name: 'Hữu Đức',
        fullName: 'Hữu Đức',
        role: '',
        bio: '',
        photo: '/photos/a1.jpeg',
    },
    bride: {
        name: 'Vũ Hiền',
        fullName: 'Vũ Hiền',
        role: '',
        bio: '',
        photo: '/photos/h1.jpeg',
    },
    families: {
        groom: {father: 'Ông Nguyễn Hữu Học', mother: 'Bà Nguyễn Thị Hiền', address: 'Thôn An Điền Kim, Xã An Phú, Thành Phố Hải Phòng'},
        bride: {father: 'Ông Vũ Văn Nhung', mother: 'Bà Đặng Thị Mùi', address: 'Thôn Quan Sơn, Xã Thái Tân, Thành Phố Hải Phòng'},
    },

    events: [
        {
            title: 'Bữa cơm thân mật',
            date: '2026-11-21',
            time: '16:30',
            place: 'Tư gia nhà gái',
            address: 'Thôn Quan Sơn, Xã Thái Tân, Thành Phố Hải Phòng',
        },
        {
            title: 'Lễ Vu Quy',
            date: '2026-11-22',
            time: '07:30',
            main: true,
            place: 'Tư gia nhà gái',
            address: 'Thôn Quan Sơn, Xã Thái Tân, Thành Phố Hải Phòng',
        },

    ],
    map: {
        query: 'Thôn Quan Sơn, Xã Thái Tân, Thành Phố Hải Phòng', // TODO: đổi thành địa điểm cụ thể nếu có
        embedUrl: 'https://maps.google.com/maps?q=21.006190,106.318445&z=17&hl=vi&output=embed',
    },

    defaultGuest: 'Quý khách',
    invitation:
        'đến dự bữa tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi.',
    thanks:
        'Cảm ơn bạn đã dành thời gian đọc thiệp và chung vui cùng chúng mình. Hẹn gặp bạn trong ngày vui!',

    photos: {
        hero: '/photos/hero.jpeg', // TODO: có thể dùng ảnh bìa khác cho nhà gái
        thanks: '/photos/a5.jpeg',
        gallery: [
            '/photos/a1.jpeg',
            '/photos/a2.jpeg',
            '/photos/a3.jpeg',
            '/photos/a4.jpeg',
            '/photos/a6.jpeg',
            '/photos/a7.jpeg',
            '/photos/a8.jpeg',
            '/photos/a9.jpeg',
        ],
    },

    cover: {enabled: true},

    rsvp: {enabled: true, deadline: '10.11.2026'}, // TODO: kiểm tra lại hạn xác nhận

    gift: {
        enabled: true, // TODO: bật lại (true) sau khi điền tài khoản nhà gái bên dưới
        autoVietQR: true,
        accounts: [
            {
                owner: 'Mừng cưới',
                bank: 'Tên ngân hàng',
                bankCode: 'MB',          // mã VietQR: VCB, TCB, MB, ACB...
                accountNo: '0868882082',
                accountName: 'Vũ Thị Hiền',
                side: 'bride',           // tài khoản nhà nào; cùng side với thiệp thì được xếp trước
            },
        ],
    },

    music: {enabled: true, src: '/music/our-song.mp3', volume: 0.6},

    wishes: [],

    meta: {
        // TODO: sửa theo đúng ngày của lễ nhà gái (21.11.2026 là Thứ bảy, âm lịch 13/10 năm Bính Ngọ)
        description: 'Thứ bảy, 21.11.2026 (Tức ngày 13 tháng 10 năm Bính Ngọ) – Rất hân hạnh được đón tiếp!',
        ogImage: '/photos/a5.jpeg',
    },

    theme: {},
};
