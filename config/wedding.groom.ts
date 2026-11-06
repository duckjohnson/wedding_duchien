/* =========================================================
   THIỆP NHÀ TRAI – Hữu Đức & Vũ Hiền
   - Ảnh: bỏ file vào public/photos rồi ghi "/photos/ten-file.jpg".
     Ô nào để "" thì trang hiện ảnh placeholder.
   - Ảnh từ web khác: thêm tên miền vào images.remotePatterns trong next.config.ts.
   ========================================================= */

import type {WeddingConfig} from './wedding.types';

export const weddingGroom: WeddingConfig = {
    side: 'groom',

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
            place: 'Tư gia nhà Trai',
            address: 'nhà văn hoá Thôn An Điền Kim, Xã An Phú, Thành Phố Hải Phòng',
        },
        {
            title: 'Lễ Thành Hôn',
            date: '2026-11-22',
            time: '07:30',
            main: true,
            place: 'Tư gia nhà trai',
            address: 'nhà văn hoá Thôn An Điền Kim, Xã An Phú, Thành Phố Hải Phòng',
        },
    ],
    map: {
        query: 'nhà văn hoá Thôn An Điền Kim, Xã An Phú, Thành Phố Hải Phòng',
        embedUrl: 'https://maps.google.com/maps?q=21.004241,106.396368&z=17&hl=vi&output=embed', // hoặc dán src của iframe "Nhúng bản đồ" từ Google Maps
    },

    defaultGuest: 'Quý khách', // khi link không có ?khach=Tên
    invitation:
        'đến dự bữa tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi.',
    thanks:
        'Cảm ơn bạn đã dành thời gian đọc thiệp và chung vui cùng chúng mình. Hẹn gặp bạn trong ngày vui!',

    photos: {
        hero: '/photos/hero.jpeg',
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

    // Phản hồi được gửi tới /api/rsvp; muốn lưu vào Google Sheet thì đặt RSVP_WEBHOOK_URL (xem README)
    rsvp: {enabled: true, deadline: '10.12.2026'}, // LƯU Ý: hạn này đang SAU ngày cưới (22.11) – kiểm tra lại

    gift: {
        enabled: true,
        autoVietQR: true, // tự tạo mã QR từ bankCode + accountNo (cần số tài khoản thật)
        accounts: [
            {
                owner: 'Mừng cưới',
                bank: 'MB Bank',
                bankCode: 'MB',
                accountNo: '0008693989999',
                accountName: 'NGUYỄN HỮU ĐỨC',
                side: 'groom',
            },

            // Muốn thiệp nhà trai hiện thêm tài khoản nhà gái (xếp sau): bỏ comment và điền thông tin
            // { owner: 'Mừng cưới nhà gái', bank: '...', bankCode: '...', accountNo: '...', accountName: '...', side: 'bride' },
        ],
    },

    // Nhạc: bỏ file vào public/music rồi ghi "/music/ten-bai.mp3". Để trống = hộp nhạc tự tổng hợp.
    music: {enabled: true, src: '/music/our-song.mp3', volume: 0.6},

    wishes: [
        {name: 'Thu Hà', message: 'Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!'},
        {name: 'Anh Quân', message: 'Mừng cho hai đứa. Hẹn gặp ở tiệc!'},
    ],

    meta: {
        description: 'Chủ nhật, 22.11.2026 (Tức ngày 14 tháng 10 năm Bính Ngọ) – Rất hân hạnh được đón tiếp!',
        ogImage: '/photos/a5.jpeg', // ảnh xem trước khi gửi link Zalo/Facebook (nên 1200×630)
    },

    // Ghi đè màu, ví dụ: { son: '#1F3A5F', kim: '#B89B5E' }
    theme: {},
};
