export const autoScrollConfig = {
  startDelay: 0, // Bắt đầu cuộn ngay lập tức sau khi mở thiệp
  speeds: [0.5, 0.8, 1.4], // Chậm, Vừa, Nhanh (pixels per frame)
  defaultSpeedIndex: 1,
  resumeDelay: 5000, // 5s không tương tác thì tiếp tục
  pausePoints: [
    { selector: '.hero', duration: 2000 },
    { selector: '.sec.letter', duration: 2000 },
    { selector: '.sec.couple', duration: 2000 },
    { selector: '.sec.events', duration: 2000 },
    { selector: '.sec.calendar', duration: 2000 },
    { selector: '.sec.album', duration: 2000 },
    { selector: '.sec.mapsec', duration: 2000 },
    { selector: '.sec.rsvp', duration: 6000 }, // Dừng lâu hơn ở RSVP
    { selector: '.sec.wishes-section', duration: 6000 }, // Dừng lâu hơn ở Sổ lưu bút
  ],
};
